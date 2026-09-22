#!/usr/bin/env python3
"""
Generate a read-only patch preparation report for Wii Mini GameCube-boot WAD research.

This script validates that user-provided WADs are the expected title types and records
version/hash/content metadata needed before any binary reverse engineering or patching.
It does not decrypt, extract, modify, or repack WAD data.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict
from typing import Iterable

import wad_inspect

EXPECTED_TITLES = {
    "system-menu": 0x0000000100000002,
    "bc": 0x0000000100000100,
    "mios": 0x0000000100000101,
}

TARGET_CONTENTS = {
    "system-menu": "System Menu boot content: likely main executable/content to reverse engineer for Disc Channel GC visibility and launch gating.",
    "bc": "BC boot content: native GameCube boot-chain executable to compare against Wii Mini behavior.",
    "mios": "MIOS boot content: GameCube-mode IOS payload; useful for compatibility comparison and installation dependency checks.",
}


def collect_wad(path: str, role: str) -> dict[str, object]:
    with open(path, "rb") as file:
        header = wad_inspect.parse_header(file)
        layout = wad_inspect.compute_layout(header)
        tmd = wad_inspect.read_tmd(file, layout, header)

    tmd_info = wad_inspect.parse_tmd(tmd)
    content_records = wad_inspect.parse_content_records(
        tmd,
        layout.data_offset,
        tmd_info["content_count"],
        tmd_info["boot_index"],
    )
    boot_records = [record for record in content_records if record.is_boot]
    if len(boot_records) != 1:
        raise ValueError(f"{path}: expected exactly one boot content, found {len(boot_records)}")

    expected_title = EXPECTED_TITLES[role]
    if tmd_info["title_id"] != expected_title:
        raise ValueError(
            f"{path}: expected {wad_inspect.title_id_text(expected_title)} for role {role}, "
            f"got {wad_inspect.title_id_text(tmd_info['title_id'])}"
        )

    return {
        "role": role,
        "path": path,
        "file_size": os.path.getsize(path),
        "sha256": wad_inspect.sha256_file(path),
        "wad_type": f"0x{header.wad_type:08X}",
        "title_id": f"{tmd_info['title_id']:016X}",
        "title": wad_inspect.title_id_text(tmd_info["title_id"]),
        "title_version": tmd_info["title_version"],
        "content_count": tmd_info["content_count"],
        "boot_index": tmd_info["boot_index"],
        "layout": asdict(layout),
        "target_note": TARGET_CONTENTS[role],
        "boot_content": content_to_dict(boot_records[0]),
        "contents": [content_to_dict(record) for record in content_records],
        "warnings": wad_inspect.validate_size(path, layout),
    }


def content_to_dict(record: wad_inspect.ContentRecord) -> dict[str, object]:
    return {
        "content_id": f"{record.content_id:08X}",
        "index": record.index,
        "type_flags": f"0x{record.type_flags:04X}",
        "type_flags_text": wad_inspect.format_type_flags(record.type_flags),
        "size": record.size,
        "data_offset": record.data_offset,
        "sha1": record.sha1.hex(),
        "is_boot": record.is_boot,
    }


def build_report(args: argparse.Namespace) -> dict[str, object]:
    wads = [
        collect_wad(args.system_menu, "system-menu"),
        collect_wad(args.bc, "bc"),
        collect_wad(args.mios, "mios"),
    ]
    return {
        "schema": "wii-mini-gc-wad-patch-prep-v1",
        "status": "read-only-prep-complete",
        "notes": [
            "No WAD data was decrypted, extracted, modified, or repacked.",
            "Do not install patched System Menu, BC, or MIOS WADs without a hardware-specific recovery plan.",
            "Next reverse-engineering step is to compare/decrypt boot content locally using user-provided lawful material and keys; do not commit keys or decrypted Nintendo code.",
        ],
        "wads": wads,
    }


def print_text_report(report: dict[str, object]) -> None:
    print(f"Patch prep schema: {report['schema']}")
    print(f"Status: {report['status']}")
    print("Notes:")
    for note in report["notes"]:
        print(f"  - {note}")
    print()

    for wad in report["wads"]:
        boot = wad["boot_content"]
        print(f"{wad['role']}: {wad['path']}")
        print(f"  Title: {wad['title']}")
        print(f"  Version: {wad['title_version']}")
        print(f"  SHA-256: {wad['sha256']}")
        print(f"  Contents: {wad['content_count']} (boot index {wad['boot_index']})")
        print(
            "  Boot content: "
            f"id {boot['content_id']}, index {boot['index']}, "
            f"size 0x{boot['size']:08X}, data offset 0x{boot['data_offset']:08X}, sha1 {boot['sha1']}"
        )
        print(f"  Target note: {wad['target_note']}")
        if wad["warnings"]:
            print("  Warnings:")
            for warning in wad["warnings"]:
                print(f"    - {warning}")
        print()


def main(argv: Iterable[str]) -> int:
    parser = argparse.ArgumentParser(description="Create a read-only WAD patch preparation report.")
    parser.add_argument("--system-menu", required=True, help="Path to System Menu WAD")
    parser.add_argument("--bc", required=True, help="Path to BC WAD")
    parser.add_argument("--mios", required=True, help="Path to MIOS WAD")
    parser.add_argument("--json", dest="json_path", help="Optional path to write the full JSON report")
    args = parser.parse_args(list(argv))

    try:
        report = build_report(args)
    except (OSError, ValueError) as exc:
        print(exc, file=sys.stderr)
        return 1

    print_text_report(report)
    if args.json_path:
        with open(args.json_path, "w", encoding="utf-8") as file:
            json.dump(report, file, indent=2)
            file.write("\n")
        print(f"Wrote JSON report: {args.json_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
