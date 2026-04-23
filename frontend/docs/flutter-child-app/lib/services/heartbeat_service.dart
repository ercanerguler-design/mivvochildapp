import 'api_client.dart';

class HeartbeatService {
  HeartbeatService(this._apiClient);

  final ApiClient _apiClient;

  Future<void> sendHeartbeat({
    required String childId,
    required String deviceId,
    String? fcmToken,
    String? appVersion,
    int? batteryLevel,
    String? osVersion,
  }) async {
    final payload = <String, dynamic>{
      'childId': childId,
      'deviceId': deviceId,
      if (fcmToken != null && fcmToken.isNotEmpty) 'fcmToken': fcmToken,
      if (appVersion != null && appVersion.isNotEmpty) 'appVersion': appVersion,
      if (batteryLevel != null) 'batteryLevel': batteryLevel,
      if (osVersion != null && osVersion.isNotEmpty) 'osVersion': osVersion,
    };

    await _apiClient.postJson('/api/mobile/heartbeat', payload);
  }
}
