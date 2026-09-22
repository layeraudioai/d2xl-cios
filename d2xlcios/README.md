# d2xl cIOS

This is a fork of davebaol's d2x-cIOS for Wii and WiiU, which I (Leseratte) named "d2xl-cIOS". 
The main goal was to make the cIOS compatible with the Wii Mini (which I accomplished using a 
hex editor). Now that I finally fixed the compiler issues and can properly compile the source 
code as of February 15th, 2020; I am planning to add more features to the cIOS as well. 


#### DISCLAIMER

````
THIS APPLICATION COMES WITH NO WARRANTY AT ALL, NEITHER EXPRESSED NOR IMPLIED.
NO ONE BUT YOURSELF IS RESPONSIBLE FOR ANY DAMAGE TO YOUR WII CONSOLE BECAUSE OF A IMPROPER USAGE OF THIS SOFTWARE.
````


#### DESCRIPTION

  This is a custom IOS for the Wii console, i.e. an IOS modified to add some new features
  not available in the official IOS.

  The d2xl cIOS is an enhanced version of the d2x cIOS, which is based on the cIOSX rev21 by Waninkoko. 


#### Wii Mini optical media limitation

  d2xl can change IOS/DIP behavior after the optical drive has accepted a disc, but it cannot
  enable a medium that the drive firmware or optical pickup rejects. In this source tree the
  DIP plugin only receives the drive command result and reads Wii DVD sectors; it has no
  interface for the pickup potentiometer, laser power, focus, or any analog measurements.

  This tree includes an opt-in Wii Mini cover override for lawful homebrew/media testing.
  Homebrew can enable it with `IOCTL_DI_COVER_OVERRIDE_SET` (`0xFB`, nonzero = enabled,
  zero = disabled) and inspect it with `IOCTL_DI_COVER_OVERRIDE_GET` (`0xFC`). While enabled,
  the DIP layer reports cover-close/cover-status requests as closed even on the physical
  drive path, so testers can identify whether an IOS-side poptop check is the immediate
  blocker for smaller discs.

  The override does not change the optical pickup, laser power, drive firmware, supported
  sector formats, or disc authentication. CD, mini-CD, recordable media, and dual-layer
  reliability remain limited by the physical drive and its firmware; unsupported media will
  still fail at the hardware read command. Do not treat a cIOS build as a replacement for a
  potentiometer adjustment or as a way to spoof the pickup's analog measurements.


#### Wii Mini GameCube boot research

  The `tools/wad-inspect` utility is a read-only metadata inspector for user-provided WADs.
  It identifies System Menu (`00000001-00000002`), BC (`00000001-00000100`), and MIOS
  (`00000001-00000101`) WADs and reports their versions, hashes, section offsets, content
  counts, and TMD content records before any patching work is attempted. The companion
  `wad_patch_prep.py` script validates those three title roles together and can write a JSON
  patch-preparation report for later reverse-engineering notes.


#### KUDOS

 * *rodries*, for the help with EHCI improvements.
 * *Crediar*, for all I learned studying [Sneek](http://code.google.com/p/sneek) source code.
 * *Oggzee*, for his brilliant fraglist.
 * *WiiPower*, for the great help with ios reload block from usb.
 * *dragbe* and *NutNut*, for their [d2x cios installer](http://code.google.com/p/d2x-cios-installer).
 * *XFlak*, for his wonderful [ModMii](http://gbatemp.net/topic/207126-modmii-for-windows) which supported d2x wads since its birth. Without ModMii d2x cios would probably never have existed. Also, XFlak had the original idea to replace the buggy EHCI module of cIOSX rev21 with the  working one from rev19. 
 * *[HackWii](http://www.hackwii.it)* and *[GBAtemp](http://www.gbatemp.net)* communities, for their ideas and support.
 * *Totoro*, for the official d2x logo
 * *ChaN*, for his [FatFs](http://elm-chan.org/fsw/ff/00index_e.html).
 * *Waninkoko*, for his cIOSX rev21.
 * *Team Twiizers* and *devkitPRO devs* for their great work in libogc.
 * *WiiGator*, for his work in the DIP plugin.
 * *kwiirk*, for his EHCI module.
 * *Hermes*, for his EHCI improvements.
 * *neimod*, for his [Custom IOS Module Toolkit](http://wiibrew.org/wiki/Custom_IOS_Module_Toolkit).
 * All the betatesters.
