<?php
// search.php — Fetch and filter locations dynamically

// Set content type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Include data file safely
if (!file_exists('data.php')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Data file not found.']);
    exit;
}
include 'data.php';

// Validate data array
if (!isset($locations) || !is_array($locations)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Invalid data format.']);
    exit;
}

// Get and sanitize search term
$searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';

// Filter locations by search term (case-insensitive)
if ($searchTerm !== '') {
    $filteredLocations = array_filter($locations, function ($location) use ($searchTerm) {
        return stripos($location['city'], $searchTerm) !== false;
    });
    $filteredLocations = array_values($filteredLocations); // Reindex array
} else {
    $filteredLocations = $locations;
}

// Escape output for security (prevent XSS)
$escapedLocations = array_map(function ($location) {
    return [
        'id' => (int)($location['id'] ?? 0),
        'city' => htmlspecialchars($location['city'] ?? '', ENT_QUOTES, 'UTF-8'),
        'description' => htmlspecialchars($location['description'] ?? '', ENT_QUOTES, 'UTF-8'),
        'phone' => htmlspecialchars($location['phone'] ?? '', ENT_QUOTES, 'UTF-8'),
        'address' => htmlspecialchars($location['address'] ?? '', ENT_QUOTES, 'UTF-8'),
        'hours' => htmlspecialchars($location['hours'] ?? '', ENT_QUOTES, 'UTF-8')
    ];
}, $filteredLocations);

// Return JSON response
echo json_encode([
    'success' => true,
    'count' => count($escapedLocations),
    'locations' => $escapedLocations
], JSON_UNESCAPED_UNICODE);
?>
