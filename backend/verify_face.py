from capture_face import capture_face
from face_embedding import generate_face_embedding, hash_embedding
from supabase_client import store_face_hash, verify_face_hash

if __name__ == "__main__":
    while True:
        print("\nOptions: (1) Register Face  (2) Verify Face  (3) Exit")
        choice = input("Enter your choice: ").strip()

        if choice == "1":
            image_path = capture_face()
            embedding = generate_face_embedding(image_path)

            if embedding is not None:
                success = store_face_hash(embedding)
                if success:
                    print("✅ Face Registered Successfully!")
                else:
                    print("❌ Duplicate face detected!")

        elif choice == "2":
            image_path = capture_face()
            embedding = generate_face_embedding(image_path)

            if embedding is not None:
                if verify_face_hash(embedding):
                    print("✅ Vote authentication successful!")
                else:
                    print("❌ Unauthorized vote attempt!")

        elif choice == "3":
            print("👋 Exiting program. Goodbye!")
            break

        else:
            print("❌ Invalid option. Please enter 1, 2, or 3.")
