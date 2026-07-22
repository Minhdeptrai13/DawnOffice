#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn is_valid_ai_text(text: &str) -> bool {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return false;
    }
    if trimmed.starts_with('{') || trimmed.starts_with('<') || trimmed.starts_with("<!DOCTYPE") {
        return false;
    }
    if trimmed.contains("502 Bad Gateway")
        || trimmed.contains("Payment Required")
        || trimmed.contains("\"error\":")
        || trimmed.contains("Cloudflare")
    {
        return false;
    }
    true
}

#[tauri::command]
async fn ask_ai_copilot(prompt: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    // Strategy 0: Check Local Ollama (http://localhost:11434/api/chat) if running on user's PC
    let body_ollama = serde_json::json!({
        "model": "llama3",
        "messages": [
            { "role": "system", "content": "You are DawnOffice AI Copilot, a smart professional office assistant. Answer concisely and helpful in Vietnamese." },
            { "role": "user", "content": prompt }
        ],
        "stream": false
    });

    if let Ok(resp) = client.post("http://localhost:11434/api/chat")
        .json(&body_ollama)
        .send()
        .await
    {
        if resp.status().is_success() {
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                if let Some(content) = json["message"]["content"].as_str() {
                    let trimmed = content.trim();
                    if !trimmed.is_empty() {
                        return Ok(trimmed.to_string());
                    }
                }
            }
        }
    }

    // Strategy 1: Free Airforce Open LLM (Llama 3.1 70B)
    let body_airforce = serde_json::json!({
        "model": "llama-3.1-70b-chat",
        "messages": [
            { "role": "system", "content": "You are DawnOffice AI Copilot, a smart professional office assistant. Answer concisely and helpful in Vietnamese." },
            { "role": "user", "content": prompt }
        ]
    });

    if let Ok(resp) = client
        .post("https://api.airforce/v1/chat/completions")
        .json(&body_airforce)
        .send()
        .await
    {
        if resp.status().is_success() {
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                if let Some(content) = json["choices"][0]["message"]["content"].as_str() {
                    let trimmed = content.trim();
                    if !trimmed.is_empty() {
                        return Ok(trimmed.to_string());
                    }
                }
            }
        }
    }

    // Strategy 2: Pollinations POST request
    let body_pollinations = serde_json::json!({
        "messages": [
            { "role": "system", "content": "You are DawnOffice AI Copilot, a smart professional office assistant. Answer concisely and helpful in Vietnamese." },
            { "role": "user", "content": prompt }
        ]
    });

    if let Ok(resp) = client
        .post("https://text.pollinations.ai/")
        .json(&body_pollinations)
        .send()
        .await
    {
        if resp.status().is_success() {
            if let Ok(text) = resp.text().await {
                if is_valid_ai_text(&text) {
                    return Ok(text.trim().to_string());
                }
            }
        }
    }

    // Strategy 3: GET fallback
    let encoded = urlencoding::encode(&prompt);
    let url = format!("https://text.pollinations.ai/{}", encoded);
    if let Ok(resp) = client.get(&url).send().await {
        if resp.status().is_success() {
            if let Ok(text) = resp.text().await {
                if is_valid_ai_text(&text) {
                    return Ok(text.trim().to_string());
                }
            }
        }
    }

    Err("Không thể kết nối đến máy chủ AI. Vui lòng thử lại!".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Ép ứng dụng bỏ qua Proxy hệ thống của Windows để sửa lỗi 10061
    std::env::set_var("HTTP_PROXY", "");
    std::env::set_var("HTTPS_PROXY", "");

    tauri::Builder::default()
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, ask_ai_copilot])
        .setup(|app| {
            // Set the window icon from the bundled icon file
            #[cfg(target_os = "windows")]
            {
                use image::GenericImageView;
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    let icon_bytes = include_bytes!("../icons/icon.png");
                    if let Ok(img) = image::load_from_memory(icon_bytes) {
                        let (w, h) = img.dimensions();
                        let rgba = img.into_rgba8().into_raw();
                        let icon = tauri::image::Image::new_owned(rgba, w, h);
                        let _ = window.set_icon(icon);
                    }
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
