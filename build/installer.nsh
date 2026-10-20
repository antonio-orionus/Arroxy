; Remembers that WinGet installed or upgraded Arroxy, so the install channel can
; report it (detectInstallChannel in src/main/installChannel.ts).
;
; WinGet's manifest passes --winget (InstallerSwitches.Custom) on every
; `winget install` and `winget upgrade`. The flag is kept in the registry
; because every reinstall, in-app updates included, first runs the old
; uninstaller, which empties $INSTDIR and electron-builder's own registry key.
; Each install then mirrors the registry value into a marker file beside the
; executable, which the app can check without spawning reg.exe.

!define ARROXY_SOURCE_KEY "Software\Arroxy"

!macro customInstall
  Push $R0
  Push $R1
  ClearErrors
  ${GetParameters} $R0
  ${GetOptions} $R0 "--winget" $R1
  ${ifNot} ${Errors}
    WriteRegStr HKCU "${ARROXY_SOURCE_KEY}" "InstallSource" "winget"
  ${endIf}
  ClearErrors
  ReadRegStr $R0 HKCU "${ARROXY_SOURCE_KEY}" "InstallSource"
  ${if} $R0 == "winget"
    FileOpen $R1 "$INSTDIR\installed-by-winget" w
    FileClose $R1
  ${endIf}
  ClearErrors
  Pop $R1
  Pop $R0
!macroend

; A reinstall runs the old uninstaller with --updated; only a real uninstall
; forgets where the install came from.
!macro customUnInstall
  ${ifNot} ${isUpdated}
    DeleteRegValue HKCU "${ARROXY_SOURCE_KEY}" "InstallSource"
    DeleteRegKey /ifempty HKCU "${ARROXY_SOURCE_KEY}"
  ${endIf}
!macroend
