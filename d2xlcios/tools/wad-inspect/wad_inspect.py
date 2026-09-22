#!/usr/bin/env python3
"""
Read-only WAD metadata inspector for Wii title research.

This tool intentionally does not decrypt, extract, modify, or repack WAD data.
It only parses the WAD header and TMD metadata from a user-provided local file.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import struct
import sys
from dataclasses import dataclass
from typing import BinaryIO, Iterable

WAD_HEADER_SIZE = 0x20
WAD_ALIGNMENT = 0x40
TMD_TITLE_ID_OFFSET = 0x18C
TMD_TITLE_VERSION_OFFSET = 0x1DC
TMD_CONTENT_COUNT_OFFSET = 0x1DE
TMD_BOOT_INDEX_OFFSET = 0x1E0
TMD_CONTENT_RECORDS_OFFSET = 0x1E4
TMD_CONTENT_RECORD_SIZE = 0x24
KNOWN_TITLES = {
    0x0000000100000002: "System Menu",
    0x0000000100000100: "BC",
    0x0000000100000101: "MIOS",
}


@dataclass(frozen=True)
class WadHeader:
    header_size: int
    wad_type: int
    cert_size: int
    crl_size: int
    ticket_size: int
    tmd_size: int
    data_size: int
    footer_size: int


@dataclass(frozen=True)
class WadLayout:
    cert_offset: int
    crl_offset: int
    ticket_offset: int
    tmd_offset: int
    data_offset: int
    footer_offset: int
    end_offset: int


@dataclass(frozen=True)
class ContentRecord:
    content_id: int
    index: int
    type_flags: int
    size: int
    sha1: bytes
    data_offset: int
    is_boot: bool


def align(value: int, boundary: int = WAD_ALIGNMENT) -> int:
    return (value + boundary - 1) & ~(boundary - 1)


def read_exact(file: BinaryIO, size: int, what: str) -> bytes:
    data = file.read(size)
    if len(data) != size:
        raise ValueError(f"Unexpected end of file while reading {what}: wanted {size} bytes, got {len(data)}")
    return data


def parse_header(file: BinaryIO) -> WadHeader:
    file.seek(0)
    raw = read_exact(file, WAD_HEADER_SIZE, "WAD header")
    header_size, wad_type, cert_size, crl_size, ticket_size, tmd_size, data_size, footer_size = struct.unpack(
        ">II6I", raw
    )
    if header_size < WAD_HEADER_SIZE:
        raise ValueError(f"Invalid WAD header size 0x{header_size:X}; expected at least 0x{WAD_HEADER_SIZE:X}")
    return WadHeader(header_size, wad_type, cert_size, crl_size, ticket_size, tmd_size, data_size, footer_size)


def compute_layout(header: WadHeader) -> WadLayout:
    cert_offset = align(header.header_size)
    crl_offset = align(cert_offset + header.cert_size)
    ticket_offset = align(crl_offset + header.crl_size)
    tmd_offset = align(ticket_offset + header.ticket_size)
    data_offset = align(tmd_offset + header.tmd_size)
    footer_offset = align(data_offset + header.data_size)
    end_offset = align(footer_offset + header.footer_size)
    return WadLayout(cert_offset, crl_offset, ticket_offset, tmd_offset, data_offset, footer_offset, end_offset)


def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_tmd(file: BinaryIO, layout: WadLayout, header: WadHeader) -> bytes:
    if header.tmd_size < TMD_CONTENT_RECORDS_OFFSET:
        raise ValueError(f"TMD is too small: 0x{header.tmd_size:X} bytes")
    file.seek(layout.tmd_offset)
    return read_exact(file, header.tmd_size, "TMD")


def parse_tmd(tmd: bytes) -> dict[str, int]:
    title_id = struct.unpack_from(">Q", tmd, TMD_TITLE_ID_OFFSET)[0]
    title_version = struct.unpack_from(">H", tmd, TMD_TITLE_VERSION_OFFSET)[0]
    content_count = struct.unpack_from(">H", tmd, TMD_CONTENT_COUNT_OFFSET)[0]
    boot_index = struct.unpack_from(">H", tmd, TMD_BOOT_INDEX_OFFSET)[0]

    expected_min_size = TMD_CONTENT_RECORDS_OFFSET + (content_count * TMD_CONTENT_RECORD_SIZE)
    if len(tmd) < expected_min_size:
        raise ValueError(
            f"TMD content table is truncated: needs 0x{expected_min_size:X} bytes, has 0x{len(tmd):X}"
        )

    return {
        "title_id": title_id,
        "title_version": title_version,
        "content_count": content_count,
        "boot_index": boot_index,
    }


def parse_content_records(tmd: bytes, data_offset: int, content_count: int, boot_index: int) -> list[ContentRecord]:
    records: list[ContentRecord] = []
    current_offset = data_offset

    for record_number in range(content_count):
        record_offset = TMD_CONTENT_RECORDS_OFFSET + (record_number * TMD_CONTENT_RECORD_SIZE)
        content_id, index, type_flags, size = struct.unpack_from(">IHHQ", tmd, record_offset)
        sha1 = tmd[record_offset + 0x10 : record_offset + 0x24]
        records.append(
            ContentRecord(
                content_id=content_id,
                index=index,
                type_flags=type_flags,
                size=size,
                sha1=sha1,
                data_offset=current_offset,
                is_boot=index == boot_index,
            )
        )
        current_offset = align(current_offset + size)

    return records


def format_type_flags(type_flags: int) -> str:
    names: list[str] = []
    if type_flags & 0x0001:
        names.append("normal")
    if type_flags & 0x4000:
        names.append("shared")
    if type_flags & 0x8000:
        names.append("optional")
    known_mask = 0xC001
    unknown_flags = type_flags & ~known_mask
    if unknown_flags:
        names.append(f"unknown:0x{unknown_flags:04X}")
    return ",".join(names) if names else "none"


def title_id_text(title_id: int) -> str:
    high = (title_id >> 32) & 0xFFFFFFFF
    low = title_id & 0xFFFFFFFF
    known = KNOWN_TITLES.get(title_id, "unknown")
    return f"{high:08X}-{low:08X} ({known})"


def validate_size(path: str, layout: WadLayout) -> list[str]:
    actual_size = os.path.getsize(path)
    warnings: list[str] = []
    if actual_size < layout.end_offset:
        warnings.append(f"file is shorter than the aligned WAD layout: 0x{actual_size:X} < 0x{layout.end_offset:X}")
    elif actual_size > layout.end_offset:
        warnings.append(f"file has trailing bytes after aligned WAD layout: 0x{actual_size:X} > 0x{layout.end_offset:X}")
    return warnings


def print_content_records(records: list[ContentRecord]) -> None:
    if not records:
        return

    print("Contents:")
    print("  #  Boot  ID        Index  Type    Flags              Size        Data offset  SHA-1")
    for record_number, record in enumerate(records):
        boot_marker = "*" if record.is_boot else " "
        flags = format_type_flags(record.type_flags)
        print(
            f"  {record_number:<2} {boot_marker:^4}  "
            f"{record.content_id:08X}  "
            f"{record.index:5}  "
            f"0x{record.type_flags:04X}  "
            f"{flags:<17}  "
            f"0x{record.size:08X}  "
            f"0x{record.data_offset:08X}   "
            f"{record.sha1.hex()}"
        )


def inspect(path: str) -> int:
    with open(path, "rb") as file:
        header = parse_header(file)
        layout = compute_layout(header)
        tmd = read_tmd(file, layout, header)
    tmd_info = parse_tmd(tmd)
    content_records = parse_content_records(tmd, layout.data_offset, tmd_info["content_count"], tmd_info["boot_index"])
    warnings = validate_size(path, layout)

    print(f"File: {path}")
    print(f"SHA-256: {sha256_file(path)}")
    print(f"WAD type: 0x{header.wad_type:08X}")
    print(f"Title ID: {title_id_text(tmd_info['title_id'])}")
    print(f"Title version: {tmd_info['title_version']}")
    print(f"Content count: {tmd_info['content_count']}")
    print(f"Boot content index: {tmd_info['boot_index']}")
    print("Sections:")
    print(f"  header: offset 0x00000000, size 0x{header.header_size:08X}")
    print(f"  cert:   offset 0x{layout.cert_offset:08X}, size 0x{header.cert_size:08X}")
    print(f"  crl:    offset 0x{layout.crl_offset:08X}, size 0x{header.crl_size:08X}")
    print(f"  ticket: offset 0x{layout.ticket_offset:08X}, size 0x{header.ticket_size:08X}")
    print(f"  tmd:    offset 0x{layout.tmd_offset:08X}, size 0x{header.tmd_size:08X}")
    print(f"  data:   offset 0x{layout.data_offset:08X}, size 0x{header.data_size:08X}")
    print(f"  footer: offset 0x{layout.footer_offset:08X}, size 0x{header.footer_size:08X}")
    print_content_records(content_records)
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    return 0


def main(argv: Iterable[str]) -> int:
    parser = argparse.ArgumentParser(description="Read-only metadata inspector for user-provided Wii WAD files.")
    parser.add_argument("wad", nargs="+", help="Path to one or more local WAD files")
    args = parser.parse_args(list(argv))

    exit_code = 0
    for index, path in enumerate(args.wad):
        if index:
            print()
        try:
            exit_code |= inspect(path)
        except OSError as exc:
            print(f"{path}: {exc}", file=sys.stderr)
            exit_code = 1
        except ValueError as exc:
            print(f"{path}: {exc}", file=sys.stderr)
            exit_code = 1
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
