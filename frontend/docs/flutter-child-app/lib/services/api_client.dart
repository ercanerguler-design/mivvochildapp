import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.mobileApiKey,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();

  final String baseUrl;
  final String mobileApiKey;
  final http.Client _httpClient;

  Uri _uri(String path) {
    final normalizedBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$normalizedBase$normalizedPath');
  }

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> payload, {
    String apiKeyHeader = 'x-mobile-api-key',
    int maxRetries = 2,
  }) async {
    Object? lastError;

    for (var attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        final response = await _httpClient
            .post(
              _uri(path),
              headers: {
                HttpHeaders.contentTypeHeader: 'application/json',
                apiKeyHeader: mobileApiKey,
              },
              body: jsonEncode(payload),
            )
            .timeout(const Duration(seconds: 15));

        final decoded = response.body.isEmpty
            ? <String, dynamic>{}
            : (jsonDecode(response.body) as Map<String, dynamic>);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return decoded;
        }

        throw HttpException('HTTP ${response.statusCode}: ${response.body}');
      } catch (error) {
        lastError = error;
        if (attempt == maxRetries) break;
        await Future<void>.delayed(Duration(milliseconds: 600 * (attempt + 1)));
      }
    }

    throw Exception('Request failed after retries: $lastError');
  }
}
