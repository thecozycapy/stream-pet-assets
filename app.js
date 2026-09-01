/* ==========================================================================
   APPLICATION CONTROLLER - PORTFOLIO INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const galleryView = document.getElementById('gallery-view');
  const playgroundView = document.getElementById('playground-view');
  
  const navGalleryBtn = document.getElementById('nav-gallery-btn');
  const navPlaygroundBtn = document.getElementById('nav-playground-btn');
  
  const widgetSearch = document.getElementById('widget-search');
  const categoryFilters = document.getElementById('category-filters');
  const widgetsGrid = document.getElementById('widgets-grid');
  const widgetsCount = document.getElementById('widgets-count');
  
  const backToGalleryBtn = document.getElementById('back-to-gallery');
  const currentWidgetTitle = document.getElementById('current-widget-title');
  const currentWidgetCategory = document.getElementById('current-widget-category');
  
  const sandboxIframe = document.getElementById('sandbox-iframe');
  const refreshPreviewBtn = document.getElementById('refresh-preview');
  
  const fieldsForm = document.getElementById('fields-form');
  const eventsGrid = document.getElementById('events-grid');
  
  const codeTabsNav = document.getElementById('code-tabs-nav');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  
  // --- Application State ---
  let activeWidget = null;
  let activeCategory = 'all';
  let searchQuery = '';
  let activeCodeTab = 'html';
  let activeControlTab = 'settings';
  let isSandboxReady = false;
  let currentFieldValues = {};

  // --- Initialize Lucide Icons ---
  lucide.createIcons();

  // --- Initial Gallery Render ---
  renderGallery();

  // --- Event Listeners: Navigation & Routing ---
  navGalleryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView('gallery');
  });

  navPlaygroundBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (activeWidget) {
      showView('playground');
    }
  });

  backToGalleryBtn.addEventListener('click', () => {
    showView('gallery');
  });

  // --- Search and Filters ---
  widgetSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderGallery();
  });

  categoryFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    
    // Toggle active category
    categoryFilters.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    activeCategory = btn.dataset.category;
    renderGallery();
  });

  // --- Simulator Controls & Tabs ---
  const controlTabBtns = document.querySelectorAll('.control-tab-btn');
  controlTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      controlTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeControlTab = btn.dataset.controlTab;
      document.querySelectorAll('.control-tab-pane').forEach(pane => pane.classList.remove('active'));
      document.getElementById(`control-pane-${activeControlTab}`).classList.add('active');
    });
  });

  // --- Code Hub Navigation & Copy ---
  codeTabsNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.code-tab-btn');
    if (!btn) return;
    
    codeTabsNav.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    activeCodeTab = btn.dataset.codeTab;
    document.querySelectorAll('.code-viewer-pane').forEach(pane => pane.classList.remove('active'));
    
    const activePane = document.getElementById(`code-pane-${activeCodeTab}`);
    activePane.classList.add('active');
    
    // Trigger syntax highlighting when tab is shown
    const codeEl = activePane.querySelector('code');
    if (codeEl) Prism.highlightElement(codeEl);
  });

  copyCodeBtn.addEventListener('click', () => {
    const activePane = document.getElementById(`code-pane-${activeCodeTab}`);
    if (!activePane) return;
    
    const codeText = activePane.querySelector('code').textContent;
    
    navigator.clipboard.writeText(codeText)
      .then(() => {
        // Change copy button to success state
        copyCodeBtn.classList.add('success');
        copyCodeBtn.querySelector('i').setAttribute('data-lucide', 'check');
        copyCodeBtn.querySelector('span').textContent = 'Copied!';
        lucide.createIcons();
        
        setTimeout(() => {
          copyCodeBtn.classList.remove('success');
          copyCodeBtn.querySelector('i').setAttribute('data-lucide', 'copy');
          copyCodeBtn.querySelector('span').textContent = 'Copy Code';
          lucide.createIcons();
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  });

  refreshPreviewBtn.addEventListener('click', () => {
    reloadSandbox();
  });

  // --- Communication with Sandbox Iframe ---
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SANDBOX_READY') {
      isSandboxReady = true;
      initializeWidgetInSandbox();
      
      // Auto-simulate first event after a short delay so the preview is never empty
      if (activeWidget && activeWidget.events && activeWidget.events.length > 0) {
        setTimeout(() => {
          if (activeWidget && activeWidget.id === 'pup-chat') {
            const firstEvt = activeWidget.events[0];
            triggerWidgetEvent(firstEvt.listener, firstEvt.data);
          }
        }, 400);
      }
    }
  });

  // --- Functions: Gallery Rendering ---
  function renderGallery() {
    widgetsGrid.innerHTML = '';
    
    // Filter widgets
    const filteredWidgets = WIDGETS_DATA.filter(widget => {
      const matchesCategory = activeCategory === 'all' || widget.category === activeCategory;
      const matchesSearch = widget.title.toLowerCase().includes(searchQuery) || 
                            widget.description.toLowerCase().includes(searchQuery) ||
                            widget.tags.some(t => t.toLowerCase().includes(searchQuery));
      return matchesCategory && matchesSearch;
    });

    widgetsCount.textContent = `Showing ${filteredWidgets.length} widget${filteredWidgets.length === 1 ? '' : 's'}`;

    if (filteredWidgets.length === 0) {
      widgetsGrid.innerHTML = `
        <div class="grid-loader">
          <i data-lucide="frown" style="width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <p>No widgets match your search criteria.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filteredWidgets.forEach(widget => {
      const card = document.createElement('div');
      card.className = 'widget-card';
      card.dataset.id = widget.id;
      
      const tagsHTML = widget.tags.map(t => `<span class="tag">${t}</span>`).join('');
      
      card.innerHTML = `
        <div class="card-thumbnail-wrapper">
          <span class="card-category-tag">${widget.category}</span>
          ${widget.image}
        </div>
        <div class="card-body">
          <h3>${widget.title}</h3>
          <p>${widget.description}</p>
          <div class="card-tags">${tagsHTML}</div>
          <button class="card-overlay-btn">
            <i data-lucide="play-circle"></i> Open Simulator
          </button>
        </div>
      `;
      
      card.addEventListener('click', () => {
        openWidgetPlayground(widget);
      });
      
      widgetsGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  // --- Open Widget detail / Playground ---
  async function openWidgetPlayground(widget) {
    activeWidget = widget;
    
    // Set UI Details
    currentWidgetTitle.textContent = widget.title;
    currentWidgetCategory.textContent = widget.category;
    
    // Toggle nav button visibility
    navPlaygroundBtn.style.display = 'flex';
    showView('playground');
    
    showLoadingState(true);
    hidePlaygroundError();
    
    try {
      // Fetch separate widget files
      const [htmlText, cssText, jsText, jsonText] = await Promise.all([
        fetchFile(`widgets/${widget.id}/widget.html`),
        fetchFile(`widgets/${widget.id}/widget.css`),
        fetchFile(`widgets/${widget.id}/widget.js`),
        fetchFile(`widgets/${widget.id}/widget.json`)
      ]);
      
      // Parse settings fields
      const jsonSchema = JSON.parse(jsonText);
      const parsedFields = parseSEFields(jsonSchema);
      
      // Store on activeWidget object for Sandbox and Code Viewer
      activeWidget.html = htmlText;
      activeWidget.css = cssText;
      activeWidget.js = jsText;
      activeWidget.jsonSchema = jsonSchema;
      activeWidget.fields = parsedFields;
      
      // Reset inputs state
      currentFieldValues = {};
      parsedFields.forEach(f => {
        currentFieldValues[f.name] = f.value;
      });

      // Load configurators
      generateSettingsForm(parsedFields);
      generateEventsGrid(widget.events);
      populateCodeHub(activeWidget);
      
      // Trigger Sandbox Loading
      reloadSandbox();
      
    } catch (err) {
      console.error("Error loading widget from directory:", err);
      showPlaygroundError(err, widget.id);
    } finally {
      showLoadingState(false);
    }
  }

  // --- Dynamic settings generator ---
  function generateSettingsForm(fields) {
    fieldsForm.innerHTML = '';
    
    if (!fields || fields.length === 0) {
      fieldsForm.innerHTML = '<div class="empty-settings-msg">No configurable settings for this widget.</div>';
      return;
    }
    
    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'form-group';
      if (field.type === 'text') group.classList.add('full-width');
      
      const label = document.createElement('label');
      label.textContent = field.label;
      group.appendChild(label);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'form-control-wrapper';
      
      if (field.type === 'color') {
        const pickerWrapper = document.createElement('div');
        pickerWrapper.className = 'color-picker-wrapper';
        
        const picker = document.createElement('input');
        picker.type = 'color';
        picker.className = 'color-input-color';
        picker.value = currentFieldValues[field.name];
        
        const hexText = document.createElement('span');
        hexText.className = 'color-input-text';
        hexText.textContent = currentFieldValues[field.name];
        
        picker.addEventListener('input', (e) => {
          const val = e.target.value;
          hexText.textContent = val;
          updateFieldValue(field.name, val);
        });
        
        pickerWrapper.appendChild(picker);
        pickerWrapper.appendChild(hexText);
        wrapper.appendChild(pickerWrapper);
      } 
      else if (field.type === 'slider') {
        group.classList.add('slider-group');
        
        // Redefining labels to sit with slider value
        label.remove();
        
        const header = document.createElement('div');
        header.className = 'slider-header';
        
        const lbl = document.createElement('label');
        lbl.textContent = field.label;
        header.appendChild(lbl);
        
        const valIndicator = document.createElement('span');
        valIndicator.className = 'slider-value';
        valIndicator.textContent = currentFieldValues[field.name];
        header.appendChild(valIndicator);
        group.insertBefore(header, group.firstChild);
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'form-slider';
        slider.min = field.min;
        slider.max = field.max;
        slider.step = field.step || 1;
        slider.value = currentFieldValues[field.name];
        
        slider.addEventListener('input', (e) => {
          const val = e.target.value;
          valIndicator.textContent = val;
          updateFieldValue(field.name, parseFloat(val));
        });
        
        wrapper.appendChild(slider);
      } 
      else if (field.type === 'select') {
        const select = document.createElement('select');
        select.className = 'form-input';
        
        field.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          if (opt.value === currentFieldValues[field.name]) o.selected = true;
          select.appendChild(o);
        });
        
        select.addEventListener('change', (e) => {
          updateFieldValue(field.name, e.target.value);
        });
        
        wrapper.appendChild(select);
      } 
      else {
        // Fallback for standard text/number
        const input = document.createElement('input');
        input.type = field.type;
        input.className = 'form-input';
        input.value = currentFieldValues[field.name];
        
        input.addEventListener('input', (e) => {
          const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
          updateFieldValue(field.name, val);
        });
        
        wrapper.appendChild(input);
      }
      
      group.appendChild(wrapper);
      fieldsForm.appendChild(group);
    });
  }

  // --- Dynamic simulator triggers generator ---
  function generateEventsGrid(events) {
    eventsGrid.innerHTML = '';
    
    // Check if Bark Alert widget is active to append Twitch Account Tester
    if (activeWidget && activeWidget.id === 'bark-alert') {
      const testerCard = document.createElement('div');
      testerCard.className = 'twitch-tester-card';
      testerCard.innerHTML = `
        <h4><i data-lucide="twitch" style="color:#a366ff; width:18px; height:18px;"></i> Twitch Account Tester</h4>
        <p class="tester-desc">Type any real Twitch username (or select a popular one) to fetch their profile picture and trigger the alert!</p>
        <div class="tester-inputs">
          <div class="form-group">
            <label>Select Popular Streamer</label>
            <select id="twitch-preset-select" class="form-input">
              <option value="pokimane">Pokimane</option>
              <option value="xqcow">xQc</option>
              <option value="ninja">Ninja</option>
              <option value="shroud">shroud</option>
              <option value="kaicenat">Kai Cenat</option>
              <option value="caseoh_">CaseOh</option>
            </select>
          </div>
          <div class="form-group">
            <label>Or Type Custom Username</label>
            <input type="text" id="twitch-custom-input" class="form-input" placeholder="streamer_username">
          </div>
        </div>
        <div class="tester-actions">
          <button class="tester-action-btn btn-follow" data-action="follower-latest">Trigger Follow</button>
          <button class="tester-action-btn btn-sub" data-action="subscriber-latest">Trigger Sub</button>
          <button class="tester-action-btn btn-cheer" data-action="cheer-latest">Trigger Cheer (100 barks)</button>
          <button class="tester-action-btn btn-tip" data-action="tip-latest">Trigger Tip ($5.00)</button>
        </div>
        <div class="tester-status" id="tester-status-msg" style="display:none;"></div>
      `;
      
      const actionBtns = testerCard.querySelectorAll('.tester-action-btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          const selectVal = document.getElementById('twitch-preset-select').value;
          const inputVal = document.getElementById('twitch-custom-input').value.trim();
          
          const username = inputVal ? inputVal : selectVal;
          if (!username) return;
          
          const statusMsg = document.getElementById('tester-status-msg');
          statusMsg.style.display = 'block';
          statusMsg.className = 'tester-status status-loading';
          statusMsg.textContent = `Connecting to Twitch & fetching avatar for ${username}...`;
          
          actionBtns.forEach(b => b.disabled = true);
          
          let avatarUrl = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
          
          try {
            const response = await fetch(`https://decapi.me/twitch/avatar/${username}`);
            const text = await response.text();
            
            if (text && text.startsWith('http')) {
              avatarUrl = text;
              statusMsg.className = 'tester-status status-success';
              statusMsg.textContent = `PFP Fetched! Triggering Bark Alert...`;
            } else {
              statusMsg.className = 'tester-status status-warning';
              statusMsg.textContent = `Twitch user not found. Loading with placeholder...`;
            }
          } catch (err) {
            console.error("Error fetching Twitch avatar:", err);
            statusMsg.className = 'tester-status status-warning';
            statusMsg.textContent = `Twitch query failed. Loading with placeholder...`;
          }
          
          const listener = btn.dataset.action;
          const mockData = {
            name: username,
            avatar: avatarUrl,
            amount: listener === 'cheer-latest' ? 100 : (listener === 'tip-latest' ? "$5.00" : 0)
          };
          
          triggerWidgetEvent(listener, mockData);
          actionBtns.forEach(b => b.disabled = false);
          
          setTimeout(() => {
            statusMsg.style.display = 'none';
          }, 3000);
        });
      });
      
      eventsGrid.appendChild(testerCard);
      
      // Separator
      const sep = document.createElement('div');
      sep.className = 'tester-separator';
      sep.innerHTML = '<span>Or Test Standard Mock Triggers</span>';
      eventsGrid.appendChild(sep);
    } 
    else if (activeWidget && activeWidget.id === 'pup-chat') {
      const testerCard = document.createElement('div');
      testerCard.className = 'twitch-tester-card';
      testerCard.innerHTML = `
        <h4><i data-lucide="message-square" style="color:#a366ff; width:18px; height:18px;"></i> Live Chat Simulator</h4>
        <p class="tester-desc">Type your own message and username to simulate it live on the chat overlay!</p>
        <div class="tester-inputs">
          <div class="form-group" style="flex: 1;">
            <label>Username</label>
            <input type="text" id="chat-sim-name" class="form-input" placeholder="ShibaLover" value="ShibaLover">
          </div>
          <div class="form-group" style="flex: 2;">
            <label>Chat Message</label>
            <input type="text" id="chat-sim-message" class="form-input" placeholder="Much cozy bone bubbles, wow! 🐾" value="Much cozy bone bubbles, wow! 🐾">
          </div>
          <div class="form-group" style="flex: 1;">
            <label>User Badge</label>
            <select id="chat-sim-badge" class="form-input">
              <option value="subscriber">Subscriber</option>
              <option value="moderator">Moderator</option>
              <option value="none">No Badge</option>
            </select>
          </div>
        </div>
        <div class="tester-actions" style="margin-top: 1rem;">
          <button class="tester-action-btn btn-follow" id="chat-sim-trigger" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i data-lucide="send" style="width:16px; height:16px;"></i> Send Test Message</button>
        </div>
      `;
      
      const sendBtn = testerCard.querySelector('#chat-sim-trigger');
      sendBtn.addEventListener('click', () => {
        const name = document.getElementById('chat-sim-name').value.trim() || "ShibaLover";
        const message = document.getElementById('chat-sim-message').value.trim() || "woof!";
        const badgeVal = document.getElementById('chat-sim-badge').value;
        
        const badges = badgeVal !== 'none' ? [badgeVal] : [];
        
        triggerWidgetEvent('chat-message', {
          name,
          message,
          badges
        });
      });
      
      eventsGrid.appendChild(testerCard);
      
      // Separator
      const sep = document.createElement('div');
      sep.className = 'tester-separator';
      sep.innerHTML = '<span>Or Test Standard Mock Messages</span>';
      eventsGrid.appendChild(sep);
    }
    
    // Standard mock buttons
    events.forEach(evt => {
      const btn = document.createElement('button');
      btn.className = `event-trigger-btn event-${evt.id}`;
      
      let icon = 'zap';
      if (evt.id.includes('follow')) icon = 'user-plus';
      else if (evt.id.includes('sub')) icon = 'heart';
      else if (evt.id.includes('cheer')) icon = 'gem';
      else if (evt.id.includes('tip')) icon = 'dollar-sign';
      else if (evt.id.includes('chat') || evt.id.includes('msg')) icon = 'message-circle';
      else if (evt.id.includes('reset')) icon = 'rotate-ccw';
      
      btn.innerHTML = `<i data-lucide="${icon}"></i> <span>${evt.label}</span>`;
      
      btn.addEventListener('click', () => {
        triggerWidgetEvent(evt.listener, evt.data);
      });
      
      eventsGrid.appendChild(btn);
    });
    
    lucide.createIcons();
  }

  // --- Populate source codes ---
  function populateCodeHub(widget) {
    document.getElementById('code-box-html').textContent = widget.html.trim();
    document.getElementById('code-box-css').textContent = widget.css.trim();
    document.getElementById('code-box-js').textContent = widget.js.trim();
    
    // Dynamic JSON representation of fields state
    updateFieldsJsonView();
    
    // Highlight currently active tab
    const activePane = document.getElementById(`code-pane-${activeCodeTab}`);
    if (activePane) {
      const codeEl = activePane.querySelector('code');
      if (codeEl) Prism.highlightElement(codeEl);
    }
  }

  function updateFieldsJsonView() {
    let formattedJson = '';
    if (activeWidget && activeWidget.jsonSchema) {
      const exportSchema = JSON.parse(JSON.stringify(activeWidget.jsonSchema));
      for (const [key, fieldConfig] of Object.entries(exportSchema)) {
        if (currentFieldValues[key] !== undefined) {
          fieldConfig.value = currentFieldValues[key];
        }
      }
      formattedJson = JSON.stringify(exportSchema, null, 2);
    } else {
      formattedJson = JSON.stringify(currentFieldValues, null, 2);
    }
    
    const jsonBox = document.getElementById('code-box-json');
    if (jsonBox) jsonBox.textContent = formattedJson;
    
    // Highlight JSON if active
    if (activeCodeTab === 'json') {
      if (jsonBox) Prism.highlightElement(jsonBox);
    }
  }

  // --- Update runtime state & trigger changes ---
  function updateFieldValue(fieldName, val) {
    currentFieldValues[fieldName] = val;
    updateFieldsJsonView();
    
    if (isSandboxReady) {
      sandboxIframe.contentWindow.postMessage({
        type: 'UPDATE_FIELDS',
        fieldData: currentFieldValues
      }, '*');
    }
  }

  function triggerWidgetEvent(listenerName, eventData) {
    if (!isSandboxReady) return;
    
    sandboxIframe.contentWindow.postMessage({
      type: 'TRIGGER_EVENT',
      listener: listenerName,
      event: eventData
    }, '*');
  }

  function reloadSandbox() {
    isSandboxReady = false;
    // Set src to trigger iframe reload lifecycle
    sandboxIframe.src = 'sandbox.html';
  }

  function initializeWidgetInSandbox() {
    if (!activeWidget) return;
    
    sandboxIframe.contentWindow.postMessage({
      type: 'INIT_WIDGET',
      html: activeWidget.html,
      css: activeWidget.css,
      js: activeWidget.js,
      fieldData: currentFieldValues
    }, '*');
  }

  // --- View switcher ---
  function showView(viewName) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    if (viewName === 'gallery') {
      galleryView.classList.add('active');
      navGalleryBtn.classList.add('active');
    } else if (viewName === 'playground' && activeWidget) {
      playgroundView.classList.add('active');
      navPlaygroundBtn.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Dynamic Loader & CORS Helpers ---
  async function fetchFile(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load ${url} (HTTP ${res.status})`);
    }
    return res.text();
  }

  function parseSEFields(jsonSchema) {
    const parsedFields = [];
    for (const [name, config] of Object.entries(jsonSchema)) {
      let type = config.type;
      if (type === 'colorpicker') type = 'color';
      if (type === 'dropdown') type = 'select';
      
      let options = [];
      if (config.options) {
        options = Object.entries(config.options).map(([value, label]) => ({ value, label }));
      }
      
      parsedFields.push({
        name,
        type,
        label: config.label,
        value: config.value,
        min: config.min,
        max: config.max,
        step: config.step,
        options
      });
    }
    return parsedFields;
  }

  function showLoadingState(isLoading) {
    const loader = document.getElementById('preview-loading-overlay');
    if (loader) loader.style.display = isLoading ? 'flex' : 'none';
  }

  function showPlaygroundError(err, widgetId) {
    const errorOverlay = document.getElementById('preview-error-overlay');
    const errorText = document.getElementById('error-message-text');
    
    if (errorOverlay && errorText) {
      if (window.location.protocol === 'file:') {
        errorText.innerHTML = `Modern browsers block loading separate files directly via the <code>file://</code> protocol.<br><br>Please run this app using a <strong>Local Web Server</strong> (e.g., VS Code's <strong>Live Server</strong> extension) to enable dynamic folder loading!`;
      } else {
        errorText.textContent = `Error loading widget files for "${widgetId}": ${err.message}. Make sure the files exist in the widgets/${widgetId}/ folder.`;
      }
      errorOverlay.style.display = 'flex';
    }
  }

  function hidePlaygroundError() {
    const errorOverlay = document.getElementById('preview-error-overlay');
    if (errorOverlay) errorOverlay.style.display = 'none';
  }
});
