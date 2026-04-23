import 'services/activity_upload_service.dart';
import 'services/api_client.dart';
import 'services/heartbeat_service.dart';
import 'services/pairing_service.dart';

void integrationExample() async {
  final api = ApiClient(
    baseUrl: 'http://10.0.2.2:3000',
    mobileApiKey: 'demo-local-mobile-key',
  );

  final pairing = PairingService(api);
  final heartbeat = HeartbeatService(api);
  final upload = ActivityUploadService(api);

  final paired = await pairing.pairChild(
    pairCode: 'PARENT_PAIRING_CODE',
    displayName: 'Ali',
    deviceId: 'android-emulator-01',
    fcmToken: 'fcm-token',
  );

  await heartbeat.sendHeartbeat(
    childId: paired.childId,
    deviceId: 'android-emulator-01',
    fcmToken: 'fcm-token',
    appVersion: '1.0.0',
    batteryLevel: 92,
    osVersion: 'Android 14',
  );

  await upload.uploadBatch(
    childId: paired.childId,
    activities: [
      ChildActivity(
        platform: 'WHATSAPP',
        type: 'MESSAGE',
        content: 'Sana zarar verecegim',
        contactUsername: 'riskli_hesap',
        timestampIso: DateTime.now().toUtc().toIso8601String(),
      ),
    ],
  );
}
