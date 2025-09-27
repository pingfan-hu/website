// Authentication system for password-protected blog content
// The password will be injected via environment variable during build

document.addEventListener('DOMContentLoaded', function() {
  // Function to create and show password modal
  function showPasswordModal(targetUrl) {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'password-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <h3 style="margin-bottom: 20px; color: #333;">🔒 Protected Content</h3>
        <p style="margin-bottom: 20px; color: #666;">This content requires a passcode to access.</p>
        <div style="margin-bottom: 20px;">
          <input type="password" id="modal-password" placeholder="Enter passcode..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
            margin-bottom: 10px;
          ">
          <div id="modal-error" style="display: none; color: red; font-size: 14px;">
            Incorrect passcode. Please try again.
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="closeModal()" style="
            padding: 10px 20px;
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          ">Cancel</button>
          <button onclick="validatePassword('${targetUrl}')" style="
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          ">Access</button>
        </div>
      </div>
    `;
    
    // Store scroll position in modal dataset
    modal.dataset.scrollY = currentScrollY;
    
    document.body.appendChild(modal);
    
    // Focus on password input
    document.getElementById('modal-password').focus();
    
    // Add Enter key support
    document.getElementById('modal-password').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        validatePassword(targetUrl);
      }
    });
    
    // Add ESC key support to close modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });
    
    // Add click-outside-to-close functionality
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        e.preventDefault();
        closeModal();
      }
    });
  }
  
  // Function to validate password
  window.validatePassword = function(targetUrl) {
    const password = document.getElementById('modal-password').value;
    const correctPassword = window.SITE_PASSWORD || 'defaultpass';
    
    if (password === correctPassword) {
      // Store authentication and redirect
      sessionStorage.setItem('auth', 'true');
      window.location.href = targetUrl;
    } else {
      // Show error
      document.getElementById('modal-error').style.display = 'block';
      document.getElementById('modal-password').value = '';
      document.getElementById('modal-password').focus();
    }
  };
  
  // Function to close modal
  window.closeModal = function() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      const currentScrollY = modal.dataset.scrollY || window.scrollY;
      modal.remove();
      // Restore scroll position to prevent jumping
      window.scrollTo(0, currentScrollY);
    }
  };
  
  // Function to attach password protection to links
  function attachPasswordProtection() {
    const protectedFiles = window.PROTECTED_FILES || [];
    
    protectedFiles.forEach(function(protectedFile) {
      const links = document.querySelectorAll(`a[href*="${protectedFile}"]`);
      links.forEach(function(link) {
        // Only attach if not already protected
        if (!link.hasAttribute('data-password-protected')) {
          link.setAttribute('data-password-protected', 'true');
          link.addEventListener('click', function(e) {
            e.preventDefault();
            showPasswordModal(link.href);
          });
        }
      });
    });
  }
  
  // Try to attach immediately
  attachPasswordProtection();
  
  // Also watch for dynamically added content
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        attachPasswordProtection();
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});