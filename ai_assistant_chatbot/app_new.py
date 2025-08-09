from flask import Flask, request, jsonify
from flask_cors import CORS
# Note the change here: we now pass the language code
from rag_chain_new_logic import create_rag_chain, get_rag_response

app = Flask(__name__)
CORS(app)

print("Starting server... This will take several minutes to load all AI models.")
create_rag_chain()
print("Server is ready to accept requests.")

@app.route('/', methods=['POST'])
def handle_chat():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get('message', '')
    # --- NEW: Get the language from the request ---
    user_language = data.get('language', 'en') # Default to 'en' if not provided

    if not user_message:
        return jsonify({"error": "Missing 'message' in request"}), 400

    print(f"Received message: '{user_message}' in language: '{user_language}'")

    # --- MODIFIED: Pass both message and language to the logic function ---
    bot_response = get_rag_response(user_message, user_language)

    return jsonify({"answer": bot_response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)