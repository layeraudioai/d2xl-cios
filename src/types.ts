export type ConsoleType = 'wii' | 'wiimini' | 'vwii';

export interface BaseIOSInfo {
  ios: number;
  version: number;
  console: ConsoleType;
  contentsCount: number;
  modulesCount: number;
  description: string;
  recommendedSlot?: number;
  features: string[];
  signatureContentId: string;
  patches: {
    contentId: string;
    description: string;
    offset: string;
    size: number;
    originalBytes: string;
    newBytes: string;
  }[];
  modules: {
    id: string;
    name: string;
    tmdModuleId: number;
  }[];
}

export interface CIOSModule {
  name: string;
  fullName: string;
  description: string;
  keyResponsibilities: string[];
  elfSizeApprox: string;
  authorNote: string;
  ioctlOrSyscalls: {
    name: string;
    code: string;
    description: string;
  }[];
}

export interface SlotConfig {
  slot: number;
  baseIOS: number;
  version: number;
  revision: number;
}

export interface GeneratorConfig {
  console: ConsoleType;
  majorVersion: number;
  minorVersion: string;
  iosRevision: number;
  slots: SlotConfig[];
  features: {
    coverOverride: boolean; // Wii Mini IOCTL 0xFB/0xFC
    nandEmulation: 'full' | 'partial' | 'rev17' | 'disabled';
    iosReloadBlock: boolean;
    stealthMode: boolean;
    virtual4kSectors: boolean;
    ledBlinker: boolean;
    usbGeckoDebug: boolean;
    koreanKeyPatch: boolean;
  };
}

export interface GameCompatibility {
  title: string;
  id: string;
  recommendedSlot: number;
  recommendedBase: number;
  reason: string;
  specialNotes?: string;
  tags: string[];
}
