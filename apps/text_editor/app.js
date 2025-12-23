let editor;

// Initialize Monaco
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: '// Start coding...',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });
});

// Change language mode when dropdown changes
document.getElementById('language').addEventListener('change', (e) => {
    const lang = e.target.value;
    monaco.editor.setModelLanguage(editor.getModel(), lang);
});

async function loadFile() {
    const filename = document.getElementById('filename').value;
    const status = document.getElementById('status');
    
    status.innerText = 'Loading...';
    try {
        const response = await fetch(`/api/load?filename=${filename}`);
        const data = await response.json();
        
        if (data.content !== undefined) {
            editor.setValue(data.content);
            status.innerText = 'Loaded successfully';
            
            // Auto-detect language by extension
            const ext = filename.split('.').pop();
            const map = { js: 'javascript', json: 'json', html: 'html', css: 'css' };
            if (map[ext]) {
                document.getElementById('language').value = map[ext];
                monaco.editor.setModelLanguage(editor.getModel(), map[ext]);
            }
        } else {
            status.innerText = 'File not found.';
        }
    } catch (err) {
        status.innerText = 'Error loading file.';
    }
}

async function saveFile() {
    const filename = document.getElementById('filename').value;
    const content = editor.getValue();
    const status = document.getElementById('status');

    status.innerText = 'Saving...';
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content })
        });
        
        if (response.ok) {
            status.innerText = 'Saved successfully!';
        } else {
            status.innerText = 'Save failed.';
        }
    } catch (err) {
        status.innerText = 'Error saving file.';
    }
}