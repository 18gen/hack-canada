import cv2

def capture_face():
    """
    Capture an image using OpenCV and save it locally as 'current_face.jpg'.
    """
    filename = "current_face.jpg"
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        cv2.imshow("Press 's' to Save Face", frame)
        if cv2.waitKey(1) & 0xFF == ord('s'):
            cv2.imwrite(filename, frame)
            break

    cap.release()
    cv2.destroyAllWindows()
    return filename

if __name__ == "__main__":
    capture_face()
