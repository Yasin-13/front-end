import torch
import cv2
import numpy as np
import easyocr
import random
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5s.pt', source='local')

def detect_violations(frame):
    # Perform object detection
    results = model(frame)
    
    # Extract bounding boxes and labels
    helmet_boxes = []
    license_plate_boxes = []
    for idx, (xmin, ymin, xmax, ymax, conf, cls) in enumerate(results.xyxy[0]):
        if int(cls) == 0:  # Assuming class 0 is for helmets
            helmet_boxes.append((int(xmin), int(ymin), int(xmax), int(ymax)))
        elif int(cls) == 1:  # Assuming class 1 is for license plates
            license_plate_boxes.append((int(xmin), int(ymin), int(xmax), int(ymax)))

    # Initialize OCR reader
    reader = easyocr.Reader(['en'])

    # Extract license plate numbers
    license_plates = []
    for (xmin, ymin, xmax, ymax) in license_plate_boxes:
        plate_region = frame[ymin:ymax, xmin:xmax]
        ocr_result = reader.readtext(plate_region)
        for detection in ocr_result:
            license_plates.append(detection[1])

    # Simulate speed data
    speed = random.uniform(20, 100)  # Simulate speed in km/h
    speed_limit = 60  # Assume a speed limit of 60 km/h

    # Simulate additional violations
    lane_violation = random.choice([True, False])
    red_light_violation = random.choice([True, False])
    illegal_turn = random.choice([True, False])
    parking_violation = random.choice([True, False])
    overtaking_violation = random.choice([True, False])

    # Detect violations
    violations = []
    if len(helmet_boxes) == 0:
        violations.append("Helmet not worn")
    if len(license_plates) == 0:
        violations.append("License plate not visible")
    if speed > speed_limit:
        violations.append("Speeding")
    if lane_violation:
        violations.append("Lane violation")
    if red_light_violation:
        violations.append("Running a red light")
    if illegal_turn:
        violations.append("Illegal turn")
    if parking_violation:
        violations.append("Parking violation")
    if overtaking_violation:
        violations.append("Overtaking violation")

    return license_plates, violations

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify(error="No file part"), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error="No selected file"), 400
    if file:
        # Save the file to disk
        filepath = f"/tmp/{file.filename}"
        file.save(filepath)

        # Process the video
        cap = cv2.VideoCapture(filepath)
        results = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            license_plates, violations = detect_violations(frame)
            for plate in license_plates:
                results.append({
                    "plate_number": plate,
                    "traffic_violation": ", ".join(violations)
                })
        cap.release()

        return jsonify(results=results)

    return jsonify(error="File processing error"), 500

@app.route('/realtime', methods=['GET'])
def realtime_detection():
    # Open video capture from the default camera (webcam)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return jsonify(error="Unable to access the camera"), 500

    results = []
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Resize the frame for faster processing
            frame_resized = cv2.resize(frame, (640, 480))

            # Detect violations in the current frame
            license_plates, violations = detect_violations(frame_resized)

            # Display the frame with detections (for debugging/viewing)
            for plate in license_plates:
                cv2.putText(frame_resized, f"Plate: {plate}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            if violations:
                cv2.putText(frame_resized, f"Violations: {', '.join(violations)}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            cv2.imshow("Real-Time Traffic Violation Detection", frame_resized)

            # Press 'q' to exit the real-time detection
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            # Collect results for API response
            for plate in license_plates:
                results.append({
                    "plate_number": plate,
                    "traffic_violation": ", ".join(violations)
                })
    finally:
        cap.release()
        cv2.destroyAllWindows()

    return jsonify(results=results)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)