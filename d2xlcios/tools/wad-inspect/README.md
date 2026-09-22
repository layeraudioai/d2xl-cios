# WAD Inspect

Read-only Wii WAD metadata inspector for GameCube-boot research on Wii Mini.

This tool intentionally does **not** decrypt, extract, modify, or repack WAD data. It only parses the WAD header and TMD metadata from local WAD files supplied by the user.

## Usage

```sh
python tools/wad-inspect/wad_inspect.py path/to/title.wad
```

Multiple WADs can be inspected in one run:

```sh
python tools/wad-inspect/wad_inspect.py SystemMenu.wad BC.wad MIOS.wad
```

To generate a read-only patch preparation report for the three GameCube-boot-related WADs:

```sh
python tools/wad-inspect/wad_patch_prep.py \
  --system-menu "wads/System Menu (Unknown v4610).wad" \
  --bc "wads/BC v6.wad" \
  --mios "wads/MIOS v10.wad" \
  --json wad-patch-prep.json
```

The patch-prep report validates the title IDs, identifies each boot content, and records hashes/offsets needed before reverse engineering. It still does not decrypt or modify any WAD data.

## Known title IDs

- `00000001-00000002`: System Menu
- `00000001-00000100`: BC
- `00000001-00000101`: MIOS

## Notes

Use this before any patching work to record exact versions, hashes, section sizes, content counts, and TMD content records. The content table marks the boot content with `*` and includes each content ID, TMD index, type flags, encrypted size, encrypted data offset inside the WAD, and SHA-1 from the TMD. Do not install modified System Menu, BC, or MIOS WADs without a hardware-specific recovery plan; bad WADs can brick a console.
