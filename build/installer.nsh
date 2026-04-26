!include "nsDialogs.nsh"
!include "WinMessages.nsh"

!ifndef BUILD_UNINSTALLER

Var /GLOBAL DesktopShortcut
Var /GLOBAL StartMenuShortcut
Var /GLOBAL DesktopCheckbox
Var /GLOBAL StartMenuCheckbox

!macro customInit
  StrCpy $DesktopShortcut   ${BST_CHECKED}
  StrCpy $StartMenuShortcut ${BST_CHECKED}
!macroend

!macro customWelcomePage
  !insertMacro MUI_PAGE_WELCOME
!macroend

; Hook confirmed in assistedInstaller.nsh line 41-44: inserts between Directory and InstFiles
!macro customPageAfterChangeDir
  Page custom OptionsPageCreate OptionsPageLeave
!macroend

Function OptionsPageCreate
  ; Set MUI2 header text at runtime (MUI2 control IDs: 1037=title, 1038=subtitle)
  GetDlgItem $R2 $HWNDPARENT 1037
  SendMessage $R2 ${WM_SETTEXT} 0 "STR:Additional Tasks"
  GetDlgItem $R2 $HWNDPARENT 1038
  SendMessage $R2 ${WM_SETTEXT} 0 "STR:Choose which additional tasks should be performed during installation."

  nsDialogs::Create 1018
  Pop $R0
  ${If} $R0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 18u "Select the additional tasks you would like Setup to perform, then click Next."
  Pop $R1

  ${NSD_CreateGroupBox} 0 22u 100% 42u "Shortcuts"
  Pop $R1

  ${NSD_CreateCheckbox} 10u 35u 90% 12u "Create a &desktop shortcut"
  Pop $DesktopCheckbox
  ${NSD_SetState} $DesktopCheckbox $DesktopShortcut

  ${NSD_CreateCheckbox} 10u 50u 90% 12u "Add to &Start Menu"
  Pop $StartMenuCheckbox
  ${NSD_SetState} $StartMenuCheckbox $StartMenuShortcut

  nsDialogs::Show
FunctionEnd

Function OptionsPageLeave
  ${NSD_GetState} $DesktopCheckbox   $DesktopShortcut
  ${NSD_GetState} $StartMenuCheckbox $StartMenuShortcut
FunctionEnd

!macro customInstall
  ${If} $DesktopShortcut == ${BST_CHECKED}
    CreateShortcut "$DESKTOP\Arroxy.lnk" "$INSTDIR\Arroxy.exe"
  ${EndIf}

  ${If} $StartMenuShortcut == ${BST_CHECKED}
    CreateDirectory "$SMPROGRAMS\Arroxy"
    CreateShortcut "$SMPROGRAMS\Arroxy\Arroxy.lnk" "$INSTDIR\Arroxy.exe"
    CreateShortcut "$SMPROGRAMS\Arroxy\Uninstall Arroxy.lnk" "$INSTDIR\Uninstall Arroxy.exe"
  ${EndIf}
!macroend

!endif ; BUILD_UNINSTALLER

; customUnInstall is compiled in both passes — no functions, safe outside the guard
!macro customUnInstall
  SetShellVarContext current
  Delete "$DESKTOP\Arroxy.lnk"
  Delete "$SMPROGRAMS\Arroxy\Arroxy.lnk"
  Delete "$SMPROGRAMS\Arroxy\Uninstall Arroxy.lnk"
  RMDir  "$SMPROGRAMS\Arroxy"
  SetShellVarContext all
  Delete "$DESKTOP\Arroxy.lnk"
  Delete "$SMPROGRAMS\Arroxy\Arroxy.lnk"
  Delete "$SMPROGRAMS\Arroxy\Uninstall Arroxy.lnk"
  RMDir  "$SMPROGRAMS\Arroxy"
!macroend
