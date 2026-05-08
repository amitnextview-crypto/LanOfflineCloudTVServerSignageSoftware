import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const { DeviceIdModule } = NativeModules as any;

function isGranted(result: string) {
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function ensureUsbMediaReadPermissions() {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 33) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ]);
    return (
      isGranted(results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]) &&
      isGranted(results[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO])
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  );
  return isGranted(result);
}

export function getSpecialAppPermissionStatus() {
  if (Platform.OS !== "android") {
    return {
      manageAllFiles: true,
      overlay: true,
      ignoreBatteryOptimizations: true,
    };
  }

  let manageAllFiles = true;
  let overlay = true;
  let ignoreBatteryOptimizations = true;

  try {
    if (typeof DeviceIdModule?.hasManageExternalStoragePermission === "function") {
      manageAllFiles = !!DeviceIdModule.hasManageExternalStoragePermission();
    }
  } catch {
    manageAllFiles = false;
  }

  try {
    if (typeof DeviceIdModule?.canDrawOverlays === "function") {
      overlay = !!DeviceIdModule.canDrawOverlays();
    }
  } catch {
    overlay = false;
  }

  try {
    if (typeof DeviceIdModule?.isIgnoringBatteryOptimizations === "function") {
      ignoreBatteryOptimizations = !!DeviceIdModule.isIgnoringBatteryOptimizations();
    }
  } catch {
    ignoreBatteryOptimizations = true;
  }

  return {
    manageAllFiles,
    overlay,
    ignoreBatteryOptimizations,
  };
}

export function openNextMissingSpecialPermission(attempt = 0) {
  if (Platform.OS !== "android") return false;
  const status = getSpecialAppPermissionStatus();

  if (!status.manageAllFiles) {
    const mode = Math.abs(Number(attempt || 0)) % 3;
    if (mode === 0 && typeof DeviceIdModule?.openManageAllFilesSettings === "function") {
      DeviceIdModule.openManageAllFilesSettings();
      return true;
    }
    if (mode === 1 && typeof DeviceIdModule?.openManageAllFilesGlobalSettings === "function") {
      DeviceIdModule.openManageAllFilesGlobalSettings();
      return true;
    }
    if (typeof DeviceIdModule?.openAppDetailsSettings === "function") {
      DeviceIdModule.openAppDetailsSettings();
      return true;
    }
    if (typeof DeviceIdModule?.openManageAllFilesSettings === "function") {
      DeviceIdModule.openManageAllFilesSettings();
      return true;
    }
  }

  if (!status.overlay && typeof DeviceIdModule?.openOverlaySettings === "function") {
    DeviceIdModule.openOverlaySettings();
    return true;
  }

  return false;
}

export function openIgnoreBatteryOptimizationSettings() {
  if (Platform.OS !== "android") return false;
  if (typeof DeviceIdModule?.openIgnoreBatteryOptimizationSettings === "function") {
    DeviceIdModule.openIgnoreBatteryOptimizationSettings();
    return true;
  }
  return false;
}

export function openOverlayPermissionSettings() {
  if (Platform.OS !== "android") return false;
  if (typeof DeviceIdModule?.openOverlaySettings === "function") {
    DeviceIdModule.openOverlaySettings();
    return true;
  }
  return false;
}
