<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = "localhost";
$user = "root";
$pass = "";
$db   = "turfdb";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(array(
        "status" => "error",
        "message" => "DB Connection Failed: " . $conn->connect_error
    ));
    exit();
}

// Check if method is POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array(
        "status" => "error",
        "message" => "Error: Only POST method is allowed"
    ));
    exit();
}

// Log received POST data for debugging
error_log("Received POST data: " . print_r($_POST, true));

// Collect POST data
$username       = isset($_POST['username']) ? trim($_POST['username']) : '';
$user_email     = isset($_POST['user_email']) ? trim($_POST['user_email']) : '';
$sport_type     = isset($_POST['sport_type']) ? trim($_POST['sport_type']) : '';
$booking_date   = isset($_POST['booking_date']) ? trim($_POST['booking_date']) : '';
$time_slot      = isset($_POST['time_slot']) ? trim($_POST['time_slot']) : '';
$duration       = isset($_POST['duration']) ? intval($_POST['duration']) : 0;
$total_amount   = isset($_POST['total_amount']) ? floatval($_POST['total_amount']) : 0;

// Validate required fields
if (empty($username) || empty($user_email) || empty($sport_type) || empty($booking_date) || empty($time_slot) || $duration == 0) {
    echo json_encode(array(
        "status" => "error",
        "message" => "Required fields are missing",
        "received_data" => array(
            "username" => $username,
            "user_email" => $user_email,
            "sport_type" => $sport_type,
            "booking_date" => $booking_date,
            "time_slot" => $time_slot,
            "duration" => $duration,
            "total_amount" => $total_amount
        )
    ));
    exit();
}

// Prepare SQL query - matches your table structure
$sql = "INSERT INTO turfmaster (username, user_email, sport_type, booking_date, time_slot, duration, total_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(array(
        "status" => "error",
        "message" => "Prepare failed: " . $conn->error
    ));
    exit();
}

// Bind parameters: s=string, i=integer, d=double/float
$stmt->bind_param("sssssid", $username, $user_email, $sport_type, $booking_date, $time_slot, $duration, $total_amount);

if ($stmt->execute()) {
    echo json_encode(array(
        "status" => "success",
        "message" => "Booking saved successfully",
        "booking_id" => $conn->insert_id,
        "data" => array(
            "username" => $username,
            "user_email" => $user_email,
            "sport_type" => $sport_type,
            "booking_date" => $booking_date,
            "time_slot" => $time_slot,
            "duration" => $duration,
            "total_amount" => $total_amount
        )
    ));
} else {
    echo json_encode(array(
        "status" => "error",
        "message" => "Execute failed: " . $stmt->error,
        "sql_error" => $conn->error
    ));
}

$stmt->close();
$conn->close();

?>
