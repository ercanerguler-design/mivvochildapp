import 'api_client.dart';

class PairingResult {
  PairingResult({
    required this.childId,
    required this.parentId,
    required this.alreadyLinked,
  });

  final String childId;
  final String parentId;
  final bool alreadyLinked;

  factory PairingResult.fromJson(Map<String, dynamic> json) {
    return PairingResult(
      childId: json['childId'] as String,
      parentId: json['parentId'] as String,
      alreadyLinked: (json['alreadyLinked'] as bool?) ?? false,
    );
  }
}

class PairingService {
  PairingService(this._apiClient);

  final ApiClient _apiClient;

  Future<PairingResult> pairChild({
    required String pairCode,
    required String displayName,
    required String birthDate,
    String? deviceId,
    String? fcmToken,
  }) async {
    final payload = <String, dynamic>{
      'pairCode': pairCode,
      'displayName': displayName,
      'birthDate': birthDate,
      if (deviceId != null && deviceId.isNotEmpty) 'deviceId': deviceId,
      if (fcmToken != null && fcmToken.isNotEmpty) 'fcmToken': fcmToken,
    };

    final response = await _apiClient.postJson('/api/setup/pair', payload);
    return PairingResult.fromJson(response);
  }
}
