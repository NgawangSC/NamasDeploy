<?php
/**
 * PHP Proxy Script for Railway Backend Uploads
 * 
 * This script proxies image requests from /uploads/* to the Railway backend
 * when Apache mod_proxy is not available or SSLProxyEngine cannot be enabled.
 * 
 * Usage: Place this file in public_html and update .htaccess to redirect
 * /uploads/* requests to this script.
 */

// Railway backend URL
$RAILWAY_BACKEND = 'https://namasdeploy-production.up.railway.app';

// Get the requested path
// First try to get from query string (when accessed via .htaccess rewrite)
$uploadPath = $_GET['path'] ?? '';

// If not in query string, extract from REQUEST_URI
if (empty($uploadPath)) {
    $requestUri = $_SERVER['REQUEST_URI'];
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    // Extract the upload path (everything after /uploads/)
    if (preg_match('#^/uploads/(.+)$#', $path, $matches)) {
        $uploadPath = $matches[1];
    }
}

// Also check if the script was called with a path directly
if (empty($uploadPath) && isset($_SERVER['PATH_INFO'])) {
    $uploadPath = ltrim($_SERVER['PATH_INFO'], '/');
}

// Validate and sanitize the path
if (empty($uploadPath)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid upload path', 'request_uri' => $_SERVER['REQUEST_URI'] ?? '']);
    exit;
}

// URL decode the path to handle special characters
$uploadPath = urldecode($uploadPath);

// Security: Prevent directory traversal attacks
if (strpos($uploadPath, '..') !== false || strpos($uploadPath, "\0") !== false) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid path']);
    exit;
}

// Construct the full Railway URL
$railwayUrl = $RAILWAY_BACKEND . '/uploads/' . $uploadPath;

// Set up cURL
$ch = curl_init($railwayUrl);

// Configure cURL options
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => false, // Stream directly to output
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HEADERFUNCTION => function($ch, $header) {
        // Forward relevant headers
        $headerLength = strlen($header);
        $headerParts = explode(':', $header, 2);
        
        if (count($headerParts) === 2) {
            $headerName = strtolower(trim($headerParts[0]));
            $headerValue = trim($headerParts[1]);
            
            // Forward these headers (exclude others like transfer-encoding, connection)
            $forwardHeaders = [
                'content-type',
                'content-length',
                'content-disposition',
                'cache-control',
                'expires',
                'last-modified',
                'etag',
            ];
            
            if (in_array($headerName, $forwardHeaders)) {
                header("$headerName: $headerValue", false);
            }
            
            // Handle CORS headers
            if (strpos($headerName, 'access-control-') === 0) {
                header("$headerName: $headerValue", false);
            }
        }
        
        return $headerLength;
    },
    CURLOPT_WRITEFUNCTION => function($ch, $data) {
        echo $data;
        return strlen($data);
    },
]);

// Add CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Execute the request
$success = curl_exec($ch);
$error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Handle cURL errors
if ($success === false || !empty($error)) {
    // Clear any output that might have been sent
    if (ob_get_level() > 0) {
        ob_clean();
    }
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Proxy error',
        'message' => $error ?: 'Failed to fetch from Railway backend',
        'url' => $railwayUrl
    ]);
    exit;
}

// Handle HTTP errors (4xx, 5xx)
if ($httpCode >= 400) {
    // Note: Headers and some content may have already been sent due to streaming
    // This is a limitation of streaming, but most images should work fine
    if (!headers_sent()) {
        http_response_code($httpCode);
    }
}
?>

