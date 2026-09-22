import { BaseIOSInfo, CIOSModule, GameCompatibility } from '../types';

export const CIOS_MODULES: CIOSModule[] = [
  {
    name: 'DIPP',
    fullName: 'DIP Plugin (Drive Interface Processor)',
    description: 'Intercepts optical drive commands and /dev/di ioctls. Enables loading games from WBFS/FAT/NTFS partitions, disc emulations, and custom media control.',
    keyResponsibilities: [
      'Intercepts DVD read commands and redirects to USB/SD storage',
      'Wii Mini optical cover override (IOCTL_DI_COVER_OVERRIDE_SET 0xFB / GET 0xFC)',
      'Dual-Layer DVD9 sector address translation (e.g. Smash Bros Brawl, Sakura Wars)',
      'Patches out DVD Video authentication commands',
      'Blocks Error 002 check on game boot'
    ],
    elfSizeApprox: '24 KB',
    authorNote: 'Enhanced by Leseratte for Wii Mini cover override; based on WiiGator & Waninkoko code.',
    ioctlOrSyscalls: [
      { name: 'IOCTL_DI_COVER_OVERRIDE_SET', code: '0xFB', description: 'Enable/disable physical optical cover open/close spoofing for lawful homebrew testing on Wii Mini.' },
      { name: 'IOCTL_DI_COVER_OVERRIDE_GET', code: '0xFC', description: 'Inspect optical cover override status.' },
      { name: 'IOCTL_DI_READ_UNENCRYPTED', code: '0x8A', description: 'Raw sector reads directly bypassing drive crypt.' },
      { name: 'IOCTL_DI_DISC_STATUS', code: '0x80', description: 'Disc detection hook.' }
    ]
  },
  {
    name: 'EHCI',
    fullName: 'EHCI Module (Enhanced Host Controller Interface)',
    description: 'High-speed USB 2.0 controller driver for the Wii Hollywood chipset, providing up to 480 Mbps transfer rates for storage devices.',
    keyResponsibilities: [
      'Provides high-speed USB 2.0 transfers instead of slow USB 1.1 OHCI',
      'Custom TinyEHCI implementation with memory ring buffers',
      'Fixed ReadCapacity & GetDescriptors bugs for high-capacity hard drives (2TB+)',
      'Support for dual USB port routing and power management',
      'Sector alignment fixes for libfat and libntfs'
    ],
    elfSizeApprox: '32 KB',
    authorNote: 'Contains contributions from rodries, kwiirk, Hermes, and digicroxx.',
    ioctlOrSyscalls: [
      { name: 'EHCI_RESET', code: '0x01', description: 'Resets the EHCI host controller and re-enumerates bus.' },
      { name: 'EHCI_BULK_TRANSFER', code: '0x05', description: 'Low latency bulk I/O for game streaming.' }
    ]
  },
  {
    name: 'ES',
    fullName: 'ES Plugin (Electronic Signature & Title Manager)',
    description: 'Patches the Wii security layer, allowing execution of unassigned titles, ticket spoofing, and IOS reload blocking.',
    keyResponsibilities: [
      'Trucha Bug (allows fakesigning of tickets and TMDs)',
      'IOS Reload Blocking (prevents games from downgrading back to an unpatched IOS)',
      'Korean Key check spoofing to prevent Korean error 003 brick',
      'Return-to-channel without requiring full system restart',
      'NAND emulation ticket redirection'
    ],
    elfSizeApprox: '18 KB',
    authorNote: 'Key to multi-IOS games like Just Dance, Metroid Prime Trilogy, and COD.',
    ioctlOrSyscalls: [
      { name: 'ES_LAUNCH_TITLE', code: '0x08', description: 'Intercepted to enforce cIOS retention during reload.' },
      { name: 'ES_IDENTIFY', code: '0x1F', description: 'Allows homebrew to identify as System Menu or any Title ID.' }
    ]
  },
  {
    name: 'FAT',
    fullName: 'FAT Filesystem & Storage Module',
    description: 'Provides ChaN FatFs 0.8b FAT16/FAT32 and NTFS file access inside IOS, power-cycling the optical disc slot LED on write operations.',
    keyResponsibilities: [
      'Native FAT16, FAT32 and NTFS file access in kernel space',
      'Optical slot drive blue LED activity blinker thread during FAT write bursts',
      'Relative path resolving to bypass long path length crashes (e.g. Disney Universe)',
      'Virtual sector size translation (4KB sectors) to bypass 500 game WBFS limit up to 4084 titles',
      'Fake NAND usage stats calculation for WiiWare & Virtual Console titles'
    ],
    elfSizeApprox: '45 KB',
    authorNote: 'Integrated with ChaN FatFs with custom multi-partition support.',
    ioctlOrSyscalls: [
      { name: 'FAT_READDIR', code: '0x12', description: 'Buffer overflow protected directory enumeration.' },
      { name: 'FAT_GETUSAGE', code: '0x1A', description: 'Spoofs NAND block sizes for WiiWare compatibility.' }
    ]
  },
  {
    name: 'FFSP',
    fullName: 'FFS Plugin (Flash File System /dev/fs Hook)',
    description: 'Hooks /dev/fs calls to transparently redirect save files, DLC, and channels to USB or SD cards (NAND Emulation).',
    keyResponsibilities: [
      'Full and partial NAND emulation redirection',
      'Bidirectional escape character handling for FAT naming restrictions',
      'Preserves real NAND access for special paths starting with `#`',
      'Enables DLC installation for Call of Duty MW3, Black Ops, and Rock Band 3 on emu NAND',
      'No More Heroes 2 save creation compatibility fix'
    ],
    elfSizeApprox: '22 KB',
    authorNote: 'Inspired by Crediar Sneek architecture with Oggzee fraglist.',
    ioctlOrSyscalls: [
      { name: 'ISFS_OPEN', code: '0x01', description: 'Redirects NAND open requests to /nands/ directory on storage.' },
      { name: 'ISFS_CREATEFILE', code: '0x04', description: 'Virtual save file creation on USB/SD.' }
    ]
  },
  {
    name: 'MLOAD',
    fullName: 'MLOAD Module (Memory & SWI Loader)',
    description: 'Resident memory dispatcher in IOS address space. Handles software interrupts (SWIs), IRQ9 rerouting, dynamic memory patching, and USB Gecko.',
    keyResponsibilities: [
      'Syscall patching and custom direct syscall vector table',
      'IRQ9 interrupt vector interception for fast async transfers',
      'Stealth mode toggle (hides cIOS presence from anti-tamper games)',
      'USB Gecko plug-and-play kernel debugging interface',
      'AHBPROT hardware access rights maintenance'
    ],
    elfSizeApprox: '20 KB',
    authorNote: 'Created by Hermes / neimod, heavily refined in d2x/d2xl by davebaol & Leseratte.',
    ioctlOrSyscalls: [
      { name: 'MLOAD_STEALTH_MODE', code: '0x30', description: 'Toggles stealth mode on/off to hide cIOS from games.' },
      { name: 'MLOAD_SET_VERSION', code: '0x35', description: 'Kernel version spoofing to clear Error 002.' }
    ]
  },
  {
    name: 'SDHC',
    fullName: 'SDHC Module (Secure Digital High Capacity)',
    description: 'High-speed SD Card host controller driver supporting SDHC and SDXC cards (formatted as FAT32) up to 2TB.',
    keyResponsibilities: [
      'Enables high speed SDHC bus mode in IOS',
      'Supports SD card NAND emulation and game loading',
      'Fixes alignment stalls for sector reads',
      'Fallback for systems running without USB mass storage'
    ],
    elfSizeApprox: '16 KB',
    authorNote: 'Essential for SD-only loaders and Wii setups without external hard drives.',
    ioctlOrSyscalls: [
      { name: 'SDIO_READ_BLOCKS', code: '0x02', description: 'Direct DMA block reads from SD card.' }
    ]
  },
  {
    name: 'USBS',
    fullName: 'USBS Module (USB Mass Storage Driver)',
    description: 'Direct SCSI transparent command set driver communicating with USB flash drives and external hard drives.',
    keyResponsibilities: [
      'SCSI Read(10), Write(10), Inquiry, and TestUnitReady commands',
      'Handles multi-LUN card readers and hub topologies',
      'Sector size auto-negotiation (512B to 4096B)',
      'Device sleep prevention heartbeat'
    ],
    elfSizeApprox: '18 KB',
    authorNote: 'Utilized as alternative storage backend for base IOS58 and IOS59.',
    ioctlOrSyscalls: [
      { name: 'USB_STORAGE_INQUIRY', code: '0x12', description: 'Retrieves vendor and model string of connected USB drive.' }
    ]
  }
];

export const BASE_IOS_LIST: BaseIOSInfo[] = [
  {
    ios: 56,
    version: 5661,
    console: 'wii',
    contentsCount: 22,
    modulesCount: 7,
    recommendedSlot: 249,
    description: 'The golden standard base for Nintendo Wii. Highest compatibility speed with over 95% of Wii game titles.',
    features: ['Fast USB loading', 'Universal game support', 'Low memory overhead', 'Optimal USB 2.0 throughput'],
    signatureContentId: '0x16',
    patches: [
      { contentId: '0x16', description: 'cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x16', description: 'cIOS signature name (d2xl)', offset: '0x10', size: 16, originalBytes: '0x31,0x32,0x30,0x38...', newBytes: '0x64,0x32,0x78,0x6c (d2xl)' },
      { contentId: '0x13', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x18', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' },
      { contentId: '0x18', description: 'Korean key check bypass', offset: '0x21424', size: 1, originalBytes: '0xD0', newBytes: '0xE0' }
    ],
    modules: [
      { id: '0x19', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x1a', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1b', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x1c', name: 'EHCI', tmdModuleId: 3 },
      { id: '0x1d', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x1e', name: 'ES', tmdModuleId: -1 },
      { id: '0x1f', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 57,
    version: 5918,
    console: 'wii',
    contentsCount: 26,
    modulesCount: 7,
    recommendedSlot: 250,
    description: 'Best base for games utilizing USB accessories, Call of Duty, Rock Band, Guitar Hero, and microphone games.',
    features: ['Enhanced USB audio stack', 'Instrument peripheral support', 'Network multiplayer stability', 'Call of Duty online patch'],
    signatureContentId: '0x18',
    patches: [
      { contentId: '0x18', description: 'cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x16', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x1c', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' },
      { contentId: '0x1c', description: 'Korean key check bypass', offset: '0x21424', size: 1, originalBytes: '0xD0', newBytes: '0xE0' }
    ],
    modules: [
      { id: '0x1d', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x1e', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1f', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x20', name: 'EHCI', tmdModuleId: 2 },
      { id: '0x21', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x22', name: 'ES', tmdModuleId: -1 },
      { id: '0x23', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 58,
    version: 6175,
    console: 'wii',
    contentsCount: 26,
    modulesCount: 7,
    recommendedSlot: 251,
    description: 'Nintendo official USB 2.0 base. Required for Nintendont GameCube loader, homebrew network tools, and official Ethernet adapters.',
    features: ['Official Nintendo USB 2.0 stack', 'Nintendont compatibility', 'USBS native driver', 'USB Ethernet stability'],
    signatureContentId: '0x13',
    patches: [
      { contentId: '0x13', description: 'cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x2', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x17', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x18', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x19', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1a', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x1b', name: 'USBS', tmdModuleId: -1 },
      { id: '0x1c', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x1d', name: 'ES', tmdModuleId: -1 },
      { id: '0x1e', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 38,
    version: 4123,
    console: 'wii',
    contentsCount: 22,
    modulesCount: 7,
    recommendedSlot: 248,
    description: 'Traditional legacy cIOS base from cIOSX rev21 era. Ideal for older homebrew apps and legacy loaders.',
    features: ['Legacy cIOS compatibility', 'Historical loader support', 'Small footprint'],
    signatureContentId: '0x15',
    patches: [
      { contentId: '0x15', description: 'cIOS signature fields', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x1', description: 'Disable DI DVD Video commands', offset: '0x68D', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x17', description: 'Reroute IRQ9 to mload', offset: '0x266A0', size: 4, originalBytes: '0xFF,0xFF,0x5A,0xD2', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x18', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x19', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1a', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x1b', name: 'EHCI', tmdModuleId: 3 },
      { id: '0x1c', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x1d', name: 'ES', tmdModuleId: -1 },
      { id: '0x1e', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 37,
    version: 5662,
    console: 'wii',
    contentsCount: 22,
    modulesCount: 7,
    recommendedSlot: 247,
    description: 'Specialized base with raw USB peripheral access. Required for certain Rock Band, Guitar Hero 5, and USB mic titles.',
    features: ['Raw USB peripheral hooks', 'Music game accessories'],
    signatureContentId: '0x1f',
    patches: [
      { contentId: '0x1f', description: 'cIOS signature fields', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x10', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x22', description: 'Reroute IRQ9 to mload', offset: '0x26E54', size: 4, originalBytes: '0xFF,0xFF,0x5B,0x4E', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x23', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x24', name: 'FAT', tmdModuleId: -1 },
      { id: '0x25', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x26', name: 'EHCI', tmdModuleId: 3 },
      { id: '0x27', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x28', name: 'ES', tmdModuleId: -1 },
      { id: '0x29', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 57,
    version: 31515,
    console: 'wiimini',
    contentsCount: 26,
    modulesCount: 7,
    recommendedSlot: 249,
    description: 'Leseratte dedicated Wii Mini cIOS base! Created specifically for the RVL-201 Wii Mini console, featuring the optical drive cover override patch.',
    features: ['Wii Mini optical cover override (IOCTL 0xFB)', 'Ethernet USB support', 'Bypasses Wii Mini hardware lockouts', 'No SD card requirement'],
    signatureContentId: '0x18',
    patches: [
      { contentId: '0x18', description: 'cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x18', description: 'd2xl identifier for Wii Mini', offset: '0x10', size: 16, originalBytes: '0x31,0x33,0x31,0x31...', newBytes: '0x64,0x32,0x78,0x6c (d2xl)' },
      { contentId: '0x16', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x1c', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x1d', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x1e', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1f', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x20', name: 'EHCI', tmdModuleId: 2 },
      { id: '0x21', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x22', name: 'ES', tmdModuleId: -1 },
      { id: '0x23', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 56,
    version: 5888,
    console: 'vwii',
    contentsCount: 22,
    modulesCount: 7,
    recommendedSlot: 249,
    description: 'vWii (Virtual Wii inside Wii U) Base 56. Specifically tuned for the Wii U Espresso CPU and Starbuck security processor.',
    features: ['Wii U hardware compatibility', 'Prevents vWii brick', 'High-speed vWii USB loading', 'Wii U GamePad video mirroring support'],
    signatureContentId: '0x16',
    patches: [
      { contentId: '0x16', description: 'vWii cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x13', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x18', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x19', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x1a', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1b', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x1c', name: 'EHCI', tmdModuleId: 3 },
      { id: '0x1d', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x1e', name: 'ES', tmdModuleId: -1 },
      { id: '0x1f', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 57,
    version: 6175,
    console: 'vwii',
    contentsCount: 26,
    modulesCount: 7,
    recommendedSlot: 250,
    description: 'vWii (Virtual Wii inside Wii U) Base 57. Ideal for USB accessories, instrument peripherals, and Call of Duty online on Wii U.',
    features: ['vWii USB peripheral compatibility', 'Multiplayer network stability', 'Instrument controller compatibility'],
    signatureContentId: '0x18',
    patches: [
      { contentId: '0x18', description: 'vWii cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x16', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' },
      { contentId: '0x1c', description: 'Reroute IRQ9 to mload', offset: '0x28544', size: 4, originalBytes: '0xFF,0xFF,0x5D,0x32', newBytes: '0x13,0x6D,0x00,0x11' }
    ],
    modules: [
      { id: '0x1d', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x1e', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1f', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x20', name: 'EHCI', tmdModuleId: 2 },
      { id: '0x21', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x22', name: 'ES', tmdModuleId: -1 },
      { id: '0x23', name: 'FFSP', tmdModuleId: -1 }
    ]
  },
  {
    ios: 58,
    version: 6432,
    console: 'vwii',
    contentsCount: 26,
    modulesCount: 7,
    recommendedSlot: 251,
    description: 'vWii (Virtual Wii inside Wii U) Base 58. Recommended for Nintendont, USB keyboard/mouse, and homebrew on vWii.',
    features: ['vWii native USB 2.0', 'Nintendont compatibility', 'Homebrew channel stability'],
    signatureContentId: '0x13',
    patches: [
      { contentId: '0x13', description: 'vWii cIOS signature magic bytes', offset: '0x00', size: 4, originalBytes: '0x66,0x69,0x72,0x6d', newBytes: '0x1e,0xe7,0xc1,0x05' },
      { contentId: '0x2', description: 'Disable DI DVD Video commands', offset: '0x6E5', size: 1, originalBytes: '0x01', newBytes: '0x00' }
    ],
    modules: [
      { id: '0x18', name: 'MLOAD', tmdModuleId: -1 },
      { id: '0x19', name: 'FAT', tmdModuleId: -1 },
      { id: '0x1a', name: 'SDHC', tmdModuleId: -1 },
      { id: '0x1b', name: 'USBS', tmdModuleId: -1 },
      { id: '0x1c', name: 'DIPP', tmdModuleId: -1 },
      { id: '0x1d', name: 'ES', tmdModuleId: -1 },
      { id: '0x1e', name: 'FFSP', tmdModuleId: -1 }
    ]
  }
];

export const POPULAR_GAMES_COMPATIBILITY: GameCompatibility[] = [
  {
    title: 'Super Smash Bros. Brawl',
    id: 'RSBE01',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Dual-Layer DVD9 disc image requires DIPP layer sector translation.',
    specialNotes: 'd2xl automatically handles DVD9 layer switch offset.',
    tags: ['Dual-Layer', 'Nintendo 1st Party', 'DVD9']
  },
  {
    title: 'Call of Duty: Black Ops / Modern Warfare 3',
    id: 'SC8E52',
    recommendedSlot: 250,
    recommendedBase: 57,
    reason: 'Requires IOS57 network socket stack and USB headset/mic peripheral support for online play.',
    specialNotes: 'Full NAND Emulation in FFSP allows online title updates & DLC maps to install properly.',
    tags: ['Online Multiplayer', 'USB Mic', 'DLC EmuNAND']
  },
  {
    title: 'Guitar Hero 5 / Rock Band 3 / The Beatles: Rock Band',
    id: 'SXEE52',
    recommendedSlot: 250,
    recommendedBase: 57,
    reason: 'Requires USB instrument hub and microphone raw transfers provided by IOS57 base.',
    specialNotes: 'Disabled file sharing control in FAT module resolves The Beatles Rock Band hang.',
    tags: ['USB Instruments', 'Microphone', 'High USB Bandwidth']
  },
  {
    title: 'Metroid Prime Trilogy',
    id: 'R3ME01',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Multiple internal IOS reloads occur when launching sub-games (Prime 1, 2, or 3).',
    specialNotes: 'Requires ES Plugin "IOS Reload Block" enabled so the loader stays in memory.',
    tags: ['IOS Reload Heavy', 'Dual-Layer', 'Anti-Reload']
  },
  {
    title: 'Disney Universe',
    id: 'SDUE4Q',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Uses deeply nested file paths that cause buffer overflows in older FatFs versions.',
    specialNotes: 'Fixed by d2x relative path resolving in FAT module.',
    tags: ['Long Path Fix', 'NAND Emu']
  },
  {
    title: 'No More Heroes 2: Desperate Struggle',
    id: 'RUUEA4',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Known for failing save file creation on NAND emulation.',
    specialNotes: 'd2xl FFSP plugin contains the specific Sneek-derived save creation patch.',
    tags: ['NAND Emu Fix', 'Save System']
  },
  {
    title: 'Wii Fit Plus',
    id: 'RFPE01',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Balance Board Bluetooth synchronization and channel installation routine.',
    specialNotes: 'Improved Error 002 fix allows channel installation to succeed.',
    tags: ['Balance Board', 'Channel Installer']
  },
  {
    title: 'Sakura Wars: So Long, My Love',
    id: 'RSWE41',
    recommendedSlot: 249,
    recommendedBase: 56,
    reason: 'Rare dual-layer title with non-standard partition table.',
    specialNotes: 'DIPP plugin detects proper dual layer break offset.',
    tags: ['Dual-Layer', 'Dual Voice Audio']
  }
];

export const CONSOLE_PRESETS: Record<string, { name: string; description: string; slots: { slot: number; baseIOS: number; version: number }[] }> = {
  wii_recommended: {
    name: 'Standard Nintendo Wii Recommended',
    description: 'The standard 3-slot setup used by d2x-cios-installer and ModMii for maximum compatibility.',
    slots: [
      { slot: 249, baseIOS: 56, version: 5661 },
      { slot: 250, baseIOS: 57, version: 5918 },
      { slot: 251, baseIOS: 58, version: 6175 }
    ]
  },
  wiimini_leseratte: {
    name: 'Wii Mini (Leseratte Edition)',
    description: 'Custom configuration for the RVL-201 Wii Mini console with optical cover override enabled.',
    slots: [
      { slot: 249, baseIOS: 57, version: 31515 },
      { slot: 250, baseIOS: 56, version: 5661 }
    ]
  },
  vwii_wiiu: {
    name: 'vWii (Wii U Enhanced)',
    description: 'Tailored for the Virtual Wii sandbox on Wii U consoles, preventing vWii semi-bricks.',
    slots: [
      { slot: 249, baseIOS: 56, version: 5888 },
      { slot: 250, baseIOS: 57, version: 6175 },
      { slot: 251, baseIOS: 58, version: 6432 }
    ]
  }
};
