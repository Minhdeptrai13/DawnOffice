import sys
import json
import io

# Ensure UTF-8 encoding for standard streams on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')

def perform_web_search(query, max_results=3):
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                title = r.get('title', '')
                body = r.get('body', '')
                if title and body:
                    results.append(f"- [{title}]: {body}")
        return "\n".join(results)
    except Exception:
        return ""

def main():
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read()
    
    try:
        data = json.loads(raw_input)
    except Exception:
        data = {"prompt": raw_input, "model": "gpt-4o"}

    prompt = data.get("prompt", "")
    model = data.get("model", "gpt-4o")
    use_search = data.get("web_search", True)

    if not model or model == "auto":
        model = "gpt-4o"

    if not prompt:
        print(json.dumps({"status": "error", "error": "Empty prompt"}, ensure_ascii=False))
        return

    # Perform DuckDuckGo Search
    search_context = ""
    if use_search:
        search_context = perform_web_search(prompt, max_results=3)

    final_prompt = prompt
    if search_context:
        final_prompt = f"Thông tin cập nhật thực tế từ DuckDuckGo Web Search:\n{search_context}\n\nYêu cầu từ người dùng:\n{prompt}"

    try:
        from g4f.client import Client
        client = Client()
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": final_prompt}]
        )
        content = response.choices[0].message.content
        if content and content.strip():
            print(json.dumps({"status": "ok", "content": content.strip()}, ensure_ascii=False))
        else:
            print(json.dumps({"status": "error", "error": "Empty response from g4f provider"}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
