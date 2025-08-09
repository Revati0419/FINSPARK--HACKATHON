from flask import Flask, request, jsonify
from flask_cors import CORS
# Ensure this is the name of your final, best logic file
from rag_chain_new_logic import create_rag_chain, get_rag_response

app = Flask(__name__)
CORS(app)

print("Starting server... This will take several minutes to load all AI models.")
create_rag_chain()
print("Server is ready to accept requests.")

# --- FIX 1: The route MUST match the URL in your JavaScript file ---
@app.route('/', methods=['POST'])
def handle_chat():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get('message', '')
    # Using the more specific language codes from the merged JS
    user_language = data.get('language', 'en-US') 
    
    # This part correctly handles the 'explain' mode from your teammate's code
    mode = data.get('mode', 'chat') 
    print(f"Received message: '{user_message}' in language: '{user_language}' with mode: '{mode}'")

    # --- FIX 2: Pass the mode to your logic function ---
    bot_response_payload = get_rag_response(user_message, user_language, mode)

    # Return the full payload (answer and contexts)
    return jsonify(bot_response_payload)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)