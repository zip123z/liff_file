document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('files');

  // 初始化LIFF
  liff.init({
    liffId: '2006561793-QmrJmxR4'
  })
  .then(() => {
    if (liff.isLoggedIn()) {
      checkUploadPermission();
      loadFiles();
    } else {
      liff.login();
    }
  })
  .catch(err => {
    console.error('LIFF initialization failed', err);
  });

  // 檢查上傳權限
  function checkUploadPermission() {
    // 這裡可以根據用戶權限顯示/隱藏上傳按鈕
    document.getElementById('uploadSection').classList.remove('hidden');
  }

  // 處理表單提交
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (fileInput.files.length === 0) {
      showToast('請選擇至少一個文件', 'error');
      return;
    }

    const formData = new FormData();
    for (const file of fileInput.files) {
      formData.append('files', file);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        showToast('文件上傳成功', 'success');
        loadFiles();
      } else {
        showToast(`上傳失敗: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('文件上傳失敗，請稍後再試', 'error');
    }
  });

  // 加載文件列表
  async function loadFiles() {
    try {
      const response = await fetch('/api/files');
      const files = await response.json();
      renderFiles(files);
    } catch (error) {
      console.error('Failed to load files:', error);
      showToast('無法加載文件列表', 'error');
    }
  }

  // 渲染文件列表
  function renderFiles(files) {
    filesList.innerHTML = '';
    files.forEach(file => {
      const li = document.createElement('li');
      li.className = 'file-item';

      const fileName = document.createElement('span');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      li.appendChild(fileName);

      const actions = document.createElement('div');
      actions.className = 'file-actions';

      if (file.type.startsWith('image/')) {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'file-action-btn view';
        viewBtn.textContent = '預覽';
        viewBtn.addEventListener('click', () => {
          window.open(file.url, '_blank');
        });
        actions.appendChild(viewBtn);
      }

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'file-action-btn download';
      downloadBtn.textContent = '下載';
      downloadBtn.addEventListener('click', () => {
        window.location.href = file.url;
      });
      actions.appendChild(downloadBtn);

      li.appendChild(actions);
      filesList.appendChild(li);
    });
  }

  // 顯示提示信息
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
});
