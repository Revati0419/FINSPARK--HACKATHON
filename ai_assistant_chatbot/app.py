from flask import Flask, request, jsonify
from flask_cors import CORS # <-- 1. IMPORT THE LIBRARY
from rag_chain_logic import create_rag_chain, get_rag_response

# 2. INITIALIZE THE FLASK APP AND ENABLE CORS
app = Flask(__name__)
CORS(app) # This enables CORS for all routes on your server.

# 3. Create the RAG chain when the server starts
print("Starting server... This will take several minutes to load the AI models.")
create_rag_chain()
print("Server is ready to accept requests.")


# 4. Define the API endpoint (this part is unchanged)
@app.route('/chatbot', methods=['POST'])
def handle_chat():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "Missing 'message' in request"}), 400

    print(f"Received message: '{user_message}'")

    bot_response = get_rag_response(user_message)

    return jsonify({"answer": bot_response})


# 5. Run the Flask App (this part is unchanged)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)