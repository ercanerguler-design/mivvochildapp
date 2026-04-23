import 'api_client.dart';

class ChildActivity {
  ChildActivity({
    required this.platform,
    required this.type,
    this.content,
    this.contactUsername,
    this.contactDisplayName,
    this.timestampIso,
  });

  final String platform;
  final String type;
  final String? content;
  final String? contactUsername;
  final String? contactDisplayName;
  final String? timestampIso;

  Map<String, dynamic> toJson() {
    return {
      'platform': platform,
      'type': type,
      if (content != null && content!.isNotEmpty) 'content': content,
      if (contactUsername != null && contactUsername!.isNotEmpty)
        'contactUsername': contactUsername,
      if (contactDisplayName != null && contactDisplayName!.isNotEmpty)
        'contactDisplayName': contactDisplayName,
      if (timestampIso != null && timestampIso!.isNotEmpty) 'timestamp': timestampIso,
    };
  }
}

class ActivityUploadService {
  ActivityUploadService(this._apiClient);

  final ApiClient _apiClient;

  Future<void> uploadBatch({
    required String childId,
    required List<ChildActivity> activities,
  }) async {
    if (activities.isEmpty) return;

    final payload = {
      'childId': childId,
      'activities': activities.map((x) => x.toJson()).toList(),
    };

    await _apiClient.postJson(
      '/api/activity',
      payload,
      apiKeyHeader: 'x-api-key',
      maxRetries: 3,
    );
  }
}
