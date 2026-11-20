'use strict';

const milestones = {
  "2001": {
    "tag": "OCTOBER 26, 2001",
    "title": "The PATRIOT Act expands surveillance powers.",
    "text": "Section 215 gave the government a way to obtain records for certain investigations. Officials later relied on it to justify collecting phone records in bulk. A majority of the oversight board said the law didn’t support that use <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-pclob215\" data-apa-year=\"2014b\" aria-label=\"PCLOB, 2014b, pp. 8–10\">PCLOB, 2014b, pp. 8–10</a>; <a class=\"citation\" href=\"#source-chronology\" data-apa-year=\"2001\" aria-label=\"USA PATRIOT Act, 2001, § 215\">USA PATRIOT Act, 2001, § 215</a>)</span>.",
    "note": "The Act passed before the 2003 invasion, as part of the wider response to 9/11.",
    "url": "https://www.govinfo.gov/content/pkg/PLAW-107publ56/pdf/PLAW-107publ56.pdf",
    "link": "Read the original Act"
  },
  "2003": {
    "tag": "MARCH 20, 2003",
    "title": "U.S. and British-led forces invade Iraq.",
    "text": "The invasion began on March 20, 2003. A later government audit described how the wars in Iraq and Afghanistan expanded the military’s use of biometric identification <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-iraq-history\" data-apa-year=\"n.d.\" aria-label=\"Office of the Historian, n.d.\">Office of the Historian, n.d.</a>; <a class=\"citation\" href=\"#source-gao08\" data-apa-year=\"2008b\" aria-label=\"GAO, 2008b, p. 7\">GAO, 2008b, p. 7</a>)</span>.",
    "note": "Biometrics in war zones and surveillance of communications in the U.S. were different parts of the wider War on Terror.",
    "url": "https://history.state.gov/countries/iraq",
    "link": "Read the historical chronology"
  },
  "2008": {
    "tag": "JULY 10, 2008",
    "title": "The FISA Amendments Act introduces Section 702.",
    "text": "Under the law, intelligence agencies could collect foreign intelligence by targeting people reasonably believed to be non-U.S. persons abroad. If those targets were talking to Americans, those exchanges could be collected too <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-fisa\" data-apa-year=\"2008\" aria-label=\"FISA Amendments Act, 2008, § 101\">FISA Amendments Act, 2008, § 101</a>; <a class=\"citation\" href=\"#source-pclob702\" data-apa-year=\"2014a\" aria-label=\"PCLOB, 2014a, p. 114\">PCLOB, 2014a, p. 114</a>)</span>.",
    "note": "Section 702 covered a different program from the bulk phone records collected under Section 215.",
    "url": "https://www.govinfo.gov/content/pkg/PLAW-110publ261/pdf/PLAW-110publ261.pdf",
    "link": "Read the 2008 law"
  },
  "2015": {
    "tag": "JUNE 2, 2015",
    "title": "The USA FREEDOM Act limits bulk collection.",
    "text": "The Act ended the Section 215 bulk phone-record program after a transition period. From November 29, 2015, its replacement used specific identifiers and records held by phone companies <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-odni\" data-apa-year=\"2015\" aria-label=\"Office of the Director of National Intelligence, 2015, p. 1\">Office of the Director of National Intelligence, 2015, p. 1</a>; <a class=\"citation\" href=\"#source-freedom\" data-apa-year=\"2015\" aria-label=\"USA FREEDOM Act, 2015, §§ 101, 103, 109\">USA FREEDOM Act, 2015, §§ 101, 103, 109</a>)</span>.",
    "note": "That ended one program. Other kinds of government surveillance continued.",
    "url": "https://www.govinfo.gov/content/pkg/PLAW-114publ23/pdf/PLAW-114publ23.pdf",
    "link": "Read the 2015 law"
  }
};

const stages = {
  "collect": {
    "left": "BODY",
    "right": "RECORD",
    "token": "◎",
    "tag": "GOVERNMENT RECORD",
    "title": "Collecting someone’s data",
    "text": "U.S. forces collected biometric data from people seeking base access, detainees, and people they encountered during military operations <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-gao09\" data-apa-year=\"2008a\" aria-label=\"GAO, 2008a, p. 2\">GAO, 2008a, p. 2</a>)</span>.",
    "question": "How much choice did people have about being scanned?",
    "echo": "That matters when we ask whether someone really consented."
  },
  "connect": {
    "left": "RECORD",
    "right": "NETWORK",
    "token": "⊞",
    "tag": "GOVERNMENT RECORD",
    "title": "Sharing the record",
    "text": "The Defense Department shared biometric data with the FBI, Homeland Security, and State. Government auditors also found gaps in sharing and problems comparing records <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-gao09\" data-apa-year=\"2008a\" aria-label=\"GAO, 2008a, pp. 3, 11–13\">GAO, 2008a, pp. 3, 11–13</a>)</span>.",
    "question": "Who else could see the record, and what could they use it for?",
    "echo": "A record collected during the war could be used beyond the place where it was taken."
  },
  "classify": {
    "left": "RECORD",
    "right": "DECISION",
    "token": "⊙",
    "tag": "ACADEMIC INTERPRETATION",
    "title": "Deciding what a record means",
    "text": "Hristova argues that biometric systems in Iraq helped officials decide whom they saw as a security threat. A person’s record could become part of a judgment about them <span class=\"citation-group\">(<a class=\"citation\" href=\"#source-hristova\" data-apa-year=\"2014\" aria-label=\"Hristova, 2014, pp. 516–517\">Hristova, 2014, pp. 516–517</a>)</span>.",
    "question": "Could someone find out how they’d been classified and challenge it?",
    "echo": "Knowing someone’s identity doesn’t tell you whether they’re a threat."
  }
};

function setupTabs(selector, callback, orientation = 'horizontal') {
  const buttons = Array.from(document.querySelectorAll(selector));
  const activate = (button, focus = false) => {
    buttons.forEach(item => {
      const selected = item === button;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const indicator = item.querySelector('.process-plus');
      if (indicator) indicator.textContent = selected ? '−' : '+';
    });
    callback(button);
    if (focus) button.focus();
  };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(button));
    button.addEventListener('keydown', event => {
      const effectiveOrientation = orientation === 'vertical' && window.matchMedia('(max-width: 760px)').matches ? 'horizontal' : orientation;
      const previous = effectiveOrientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const next = effectiveOrientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      let nextIndex;
      if (event.key === previous) nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === next) nextIndex = (index + 1) % buttons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = buttons.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      activate(buttons[nextIndex], true);
    });
  });
}

setupTabs('[data-year]', button => {
  const year = button.dataset.year;
  const milestone = milestones[year];
  const panel = document.getElementById('timeline-panel');
  panel.setAttribute('aria-labelledby', button.id);
  panel.innerHTML = `<span class="timeline-year" aria-hidden="true">${year}</span><div class="timeline-content"><span class="tag">${milestone.tag}</span><h3>${milestone.title}</h3><p>${milestone.text}</p><p class="timeline-note">${milestone.note}</p><a class="text-link" href="${milestone.url}" target="_blank" rel="noopener noreferrer">${milestone.link}</a></div>`;
});

setupTabs('[data-step]', button => {
  const stage = stages[button.dataset.step];
  const panel = document.getElementById('process-panel');
  panel.setAttribute('aria-labelledby', button.id);
  panel.innerHTML = `<div class="record-visual" aria-hidden="true"><span>${stage.left}</span><i class="record-line"></i><span class="record-token">${stage.token}</span><i class="record-line"></i><span>${stage.right}</span></div><span class="tag">${stage.tag}</span><h3>${stage.title}</h3><p class="process-explanation">${stage.text}</p><div class="process-question"><span>THE RIGHTS QUESTION</span><p>${stage.question}</p></div><p class="process-echo">${stage.echo}</p>`;
}, 'vertical');

const processTabList = document.querySelector('.process-tabs');
if (processTabList) {
  const layout = window.matchMedia('(max-width: 760px)');
  const updateOrientation = () => processTabList.setAttribute('aria-orientation', layout.matches ? 'horizontal' : 'vertical');
  layout.addEventListener('change', updateOrientation);
  updateOrientation();
}

document.querySelectorAll('[data-answer]').forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-answer]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('quiz-feedback').textContent = button.dataset.answer === 'no'
      ? 'Correct. The PATRIOT Act passed on October 26, 2001. The invasion came in March 2003, so the Act was already in place. Both are part of the wider War on Terror story.'
      : 'The dates do not line up: the PATRIOT Act passed in 2001, and the invasion came in 2003. The Act was already in place when the war began.';
  });
});

const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-nav');
if (menuButton && menu) {
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    menuButton.querySelector('span').textContent = '+';
  }
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menu.classList.toggle('is-open', isOpen);
    menuButton.querySelector('span').textContent = isOpen ? '−' : '+';
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuButton.focus();
    }
  });
}

const progressBar = document.querySelector('.reading-progress');
if (progressBar) {
  let pending = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0}%`;
    pending = false;
  };
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; window.requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

const metadataWidget = document.querySelector('.metadata-widget');
if (metadataWidget) {
  const descriptions = {
    numbers: 'You can see which numbers were in touch, even without hearing the conversation.',
    time: 'Each timestamp tells you when a call happened. It doesn’t tell you why someone called.',
    duration: 'The record also shows how long each call lasted. A longer call doesn’t explain what was said.'
  };
  setupTabs('[data-metadata-view]', button => {
    const view = button.dataset.metadataView;
    metadataWidget.dataset.view = view;
    document.getElementById('metadata-panel').setAttribute('aria-labelledby', button.id);
    metadataWidget.querySelector('[data-metadata-description]').textContent = descriptions[view];
  });
}
