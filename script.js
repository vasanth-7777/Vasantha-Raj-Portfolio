(function(){
  var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var current=null,opener=null;
  var doorsSec=$('#doors-sec'),doorsEl=$('#doors'),portalFlash=$('#portal-flash');

  // Intro Preloader Animation (Opening up the work)
  var preloader=$('#intro-preloader');
  if(preloader){
    var pNum=$('#preloader-num'),pBar=$('#preloader-bar-fill'),stack=$('#intro-pill-stack');
    var pills=$$('.intro-pill',stack);
    pills.forEach(function(pill,i){
      if(i>0){
        pill.style.transform='translateY(-'+(i*40)+'px) scale('+(1-i*0.04)+')';
        pill.style.opacity='0';
      }
    });

    var duration=1600;
    var startTime=performance.now();

    function stepPreloader(now){
      var progress=Math.min((now-startTime)/duration,1);
      var countVal=Math.round(progress*100);
      if(pNum)pNum.textContent=String(countVal).padStart(3,'0');
      if(pBar)pBar.style.width=countVal+'%';

      pills.forEach(function(pill,i){
        var threshold=(i/pills.length)*0.65;
        if(progress>threshold){
          pill.style.opacity='1';
          var factor=Math.min((progress-threshold)/0.35,1);
          var curY=-(i*40)*(1-factor);
          var curScale=(1-i*0.04)+(i*0.04*factor);
          pill.style.transform='translateY('+curY+'px) scale('+curScale+')';
        }
      });

      if(progress<1){
        requestAnimationFrame(stepPreloader);
      }else{
        setTimeout(function(){
          if(stack)stack.classList.add('scatter');
          setTimeout(function(){
            preloader.classList.add('done');
            setTimeout(function(){preloader.style.display='none'},900);
          },320);
        },150);
      }
    }
    requestAnimationFrame(stepPreloader);
  }

  // Clock (Chennai / Bangalore IST)
  function tick(){
    var d=new Date(),t=d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'Asia/Kolkata'}).replace(' ','');
    $('#time').textContent=t;$('#time2').textContent=t;
    $('#date').textContent=d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'});
  }
  tick();setInterval(tick,30000);

  function loadVideos(room){
    $$('video[data-src]',room).forEach(function(v){
      v.src=v.dataset.src;v.removeAttribute('data-src');
    });
  }

  // Interactive Door Hover Preview (Matching Image 1)
  var previewCards=$$('.door-preview-card');
  function setDoorPreview(doorName){
    if(!doorName)return;
    previewCards.forEach(function(card){
      if(card.dataset.preview===doorName){
        card.classList.add('active');
      }else{
        card.classList.remove('active');
      }
    });
  }

  $$('.door-wrapper').forEach(function(wrapper){
    wrapper.addEventListener('mouseenter',function(){
      var t=wrapper.dataset.target;
      if(t)setDoorPreview(t);
    });
    wrapper.addEventListener('focusin',function(){
      var t=wrapper.dataset.target;
      if(t)setDoorPreview(t);
    });
  });

  // 3D Door Portal Walk-Through Zoom Transition (as in Video 2)
  function openDoor(name,doorBtn){
    if(current)return;
    var room=$('#room-'+name);
    if(!room)return;
    opener=document.activeElement;

    var targetDoor=doorBtn||$('.door[data-door="'+name+'"]');

    // 1. Swing clicked door open inwards into 3D space
    if(targetDoor){
      targetDoor.classList.add('open');
      if(doorsEl){
        var bRect=targetDoor.getBoundingClientRect();
        var dRect=doorsEl.getBoundingClientRect();
        var cx=Math.round((bRect.left+bRect.width/2)-dRect.left);
        var cy=Math.round((bRect.top+bRect.height/2)-dRect.top);
        doorsEl.style.transformOrigin=cx+'px '+cy+'px';
      }
    }

    // 2. Zoom camera forward through the doorway
    setTimeout(function(){
      if(doorsEl)doorsEl.classList.add('zooming');
      if(portalFlash)portalFlash.classList.add('active');
    },280);

    // 3. Step inside room with 3D entry
    setTimeout(function(){
      current=room;
      room.hidden=false;
      room.scrollTop=0;
      room.classList.remove('leaving');
      room.classList.add('entering');
      document.body.style.overflow='hidden';
      loadVideos(room);
      var b=$('.back',room);
      if(b)b.focus({preventScroll:true});
    },550);

    setTimeout(function(){
      if(portalFlash)portalFlash.classList.remove('active');
    },700);
  }

  function closeDoor(){
    if(!current)return;
    var room=current;
    room.classList.remove('entering');
    room.classList.add('leaving');
    if(portalFlash)portalFlash.classList.add('active');

    setTimeout(function(){
      $$('video',room).forEach(function(v){v.pause()});
      room.hidden=true;
      room.classList.remove('leaving');
      document.body.style.overflow='';
      current=null;

      if(doorsEl)doorsEl.classList.remove('zooming');
      $$('.door.open').forEach(function(d){d.classList.remove('open')});
      if(portalFlash)portalFlash.classList.remove('active');
      if(opener&&opener.focus)opener.focus({preventScroll:true});
    },420);
  }

  document.addEventListener('click',function(e){
    var d=e.target.closest('[data-door]');
    if(d){
      e.preventDefault();
      var n=d.dataset.door;
      if(current){
        if(current.id!=='room-'+n){
          closeDoor();
          setTimeout(function(){openDoor(n,$('.door[data-door="'+n+'"]'))},450);
        }
        return;
      }
      openDoor(n,d.closest('.door')||$('.door[data-door="'+n+'"]'));
      return;
    }
    if(e.target.closest('[data-close]')){closeDoor();return}
    if(e.target.closest('[data-home]')&&current){closeDoor()}
  });

  // ==========================================================================
  // Hire Dialog System (Opening & Submitting #hire modal)
  // ==========================================================================
  var hireDialog = $('#hire');
  var hireForm = $('#hire-form');
  var hireMsg = $('#hire-msg');

  function openHire(){
    if(!hireDialog) return;
    if(typeof hireDialog.showModal === 'function'){
      hireDialog.showModal();
    } else {
      hireDialog.setAttribute('open', '');
    }
    var firstInput = hireDialog.querySelector('input:not([type="hidden"])');
    if(firstInput) firstInput.focus();
  }

  function closeHire(){
    if(!hireDialog) return;
    if(typeof hireDialog.close === 'function'){
      hireDialog.close();
    } else {
      hireDialog.removeAttribute('open');
    }
  }

  document.addEventListener('click', function(e){
    if(e.target.closest('[data-hire]')){
      e.preventDefault();
      openHire();
      return;
    }
    if(e.target.closest('[data-x]') && e.target.closest('#hire')){
      e.preventDefault();
      closeHire();
      return;
    }
    if(e.target === hireDialog){
      closeHire();
      return;
    }
  });

  if(hireForm){
    hireForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = (hireForm.elements['name'] ? hireForm.elements['name'].value.trim() : '');
      var email = (hireForm.elements['email'] ? hireForm.elements['email'].value.trim() : '');
      var phone = (hireForm.elements['phone'] ? hireForm.elements['phone'].value.trim() : '');
      var message = (hireForm.elements['message'] ? hireForm.elements['message'].value.trim() : '');

      if(!name || !email || !message){
        if(hireMsg) {
          hireMsg.textContent = 'Please fill out all required fields.';
          hireMsg.style.color = '#e0705a';
        }
        return;
      }

      var subject = encodeURIComponent('Portfolio Inquiry from ' + name);
      var body = encodeURIComponent(['Name: ' + name, 'Email: ' + email, 'Phone: ' + phone, '', 'Message:', message].join('\n'));
      var mailtoUrl = 'mailto:vasanth93422@gmail.com?subject=' + subject + '&body=' + body;

      if(hireMsg) {
        hireMsg.textContent = 'Opening your email client...';
        hireMsg.style.color = 'var(--brass)';
      }

      window.open(mailtoUrl, '_blank');

      setTimeout(function(){
        if(hireMsg) {
          hireMsg.textContent = 'Thank you! Talk soon.';
          hireMsg.style.color = '#73c991';
        }
        setTimeout(function(){
          closeHire();
          hireForm.reset();
          if(hireMsg) {
            hireMsg.textContent = 'I reply within one business day.';
            hireMsg.style.color = '';
          }
        }, 1500);
      }, 500);
    });
  }

  // ==========================================================================
  // DESK SPIRAL FLIP CALENDAR PAD ("need this design in front page kept turning")
  // ==========================================================================
  var rolesData=[
    {title:'Software Engineer', door:'engineer'},
    {title:'Video Editor', door:'editor'},
    {title:'Content Creator', door:'creator'}
  ];
  var rIdx=0;
  var calSheet=$('#calendar-sheet'),roleEl=$('#role'),countEl=$('#count');
  var flipInterval=null;

  function turnCalendarPage(){
    if(document.hidden||current||!calSheet)return;
    calSheet.classList.remove('flipping');
    void calSheet.offsetWidth;
    calSheet.classList.add('flipping');

    setTimeout(function(){
      rIdx=(rIdx+1)%rolesData.length;
      var cur=rolesData[rIdx];
      if(roleEl)roleEl.textContent=cur.title;
      if(countEl)countEl.textContent='0'+(rIdx+1)+' / 03';
    },320);

    setTimeout(function(){
      calSheet.classList.remove('flipping');
    },650);
  }

  if(calSheet){
    flipInterval=setInterval(turnCalendarPage,2800);
    calSheet.addEventListener('click',function(){
      turnCalendarPage();
    });
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-scroll]');
    if(b){
      var targetId=b.dataset.scroll;
      var targetEl=$('#'+targetId)||document.querySelector(targetId);
      if(targetEl){
        targetEl.scrollIntoView({behavior:'smooth'});
      }
    }
  });

  // ==========================================================================
  // INTERACTIVE FLEXIBLE PHYSICS BATMAN PULL CHAIN (Multi-Segment Verlet Dynamics)
  // ==========================================================================
  var root = document.documentElement;
  try { if (localStorage.getItem('theme') === 'light') root.dataset.theme = 'light'; } catch(e){}

  function toggleTheme(){
    var isLight = root.dataset.theme !== 'light';
    if (isLight) root.dataset.theme = 'light'; else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e){}
  }

  var ropeContainer = $('#rope-interactive');
  var ropePath = $('#rope-path');
  var ropeHandle = $('#rope-handle');
  var ropeChain = $('#rope-chain');

  if (ropeContainer && ropePath && ropeHandle && ropeChain) {
    var NUM_LINKS = 8;
    var NUM_POINTS = NUM_LINKS + 1; // 8 nodes: Point 0 (ceiling anchor) to Point 7 (Batarang)
    var restLength = Math.max(180, Math.min(window.innerHeight * 0.28, 240));
    var segLen = restLength / NUM_LINKS;

    // Create chain link DOM elements
    ropeChain.innerHTML = '';
    var linkEls = [];
    for (var i = 0; i < NUM_LINKS; i++) {
      var link = document.createElement('div');
      link.className = 'bat-link';
      ropeChain.appendChild(link);
      linkEls.push(link);
    }

    // Initialize Verlet particle nodes
    var points = [];
    for (var i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: 40,
        y: i * segLen,
        oldX: 40,
        oldY: i * segLen,
        vx: 0,
        vy: 0
      });
    }

    var isDragging = false;
    var dragTargetX = 0;
    var dragTargetY = restLength;
    var dragVelX = 0, dragVelY = 0;
    var lastPtrX = 0, lastPtrY = 0;
    var ptrStartX = 0, ptrStartY = 0;
    var animFrame = null;

    function getAnchorScreenPos(){
      var r = ropeContainer.getBoundingClientRect();
      return { x: r.left + 40, y: r.top };
    }

    // Multi-segment distance relaxation solver (creates authentic chain sagging & bending)
    function solveConstraints(isDrag){
      var iterations = isDrag ? 14 : 8;
      var curSegLen = restLength / NUM_LINKS;

      for (var iter = 0; iter < iterations; iter++) {
        // Pin Point 0 to ceiling rosette (40, 0)
        points[0].x = 40;
        points[0].y = 0;

        // If dragging, pin handle Point 7 to cursor drag target
        if (isDrag) {
          points[NUM_LINKS].x = 40 + dragTargetX;
          points[NUM_LINKS].y = dragTargetY;
        }

        // Apply chain distance constraints between adjacent nodes
        for (var i = 0; i < NUM_LINKS; i++) {
          var p1 = points[i];
          var p2 = points[i + 1];
          var dx = p2.x - p1.x;
          var dy = p2.y - p1.y;
          var dist = Math.hypot(dx, dy);

          if (dist > 0.0001) {
            var diff = (dist - curSegLen) / dist;
            var adjX = dx * diff * 0.5;
            var adjY = dy * diff * 0.5;

            if (i === 0) {
              // Anchor is pinned
              p2.x -= adjX * 2;
              p2.y -= adjY * 2;
            } else if (i === NUM_LINKS - 1 && isDrag) {
              // Tip is pinned to cursor
              p1.x += adjX * 2;
              p1.y += adjY * 2;
            } else {
              p1.x += adjX;
              p1.y += adjY;
              p2.x -= adjX;
              p2.y -= adjY;
            }
          }
        }
      }
    }

    function renderRope(){
      // 1. Render chain links rotated along each segment
      for (var i = 0; i < NUM_LINKS; i++) {
        var p1 = points[i];
        var p2 = points[i + 1];
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var angle = Math.atan2(dx, dy) * (180 / Math.PI);

        linkEls[i].style.transform = 'translate3d(' + p1.x.toFixed(1) + 'px, ' + p1.y.toFixed(1) + 'px, 0) rotate(' + angle.toFixed(1) + 'deg)';
      }

      // 2. Render smooth dark bronze spline core behind links
      var d = 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
      for (var i = 1; i < NUM_POINTS; i++) {
        var prev = points[i - 1];
        var curr = points[i];
        var midX = (prev.x + curr.x) / 2;
        var midY = (prev.y + curr.y) / 2;
        d += ' Q ' + prev.x.toFixed(1) + ' ' + prev.y.toFixed(1) + ' ' + midX.toFixed(1) + ' ' + midY.toFixed(1);
      }
      d += ' L ' + points[NUM_LINKS].x.toFixed(1) + ' ' + points[NUM_LINKS].y.toFixed(1);
      ropePath.setAttribute('d', d);

      // 3. Render Batarang handle connected to tip node
      var tipNode = points[NUM_LINKS];
      var preTipNode = points[NUM_LINKS - 1];
      var tipDx = tipNode.x - preTipNode.x;
      var tipDy = tipNode.y - preTipNode.y;
      var handleAngle = Math.atan2(tipDx, tipDy) * (180 / Math.PI);
      handleAngle = Math.max(-55, Math.min(55, handleAngle));

      ropeHandle.style.transform = 'translate3d(' + tipNode.x.toFixed(1) + 'px, ' + tipNode.y.toFixed(1) + 'px, 0) rotate(' + handleAngle.toFixed(1) + 'deg)';
    }

    // Dynamic physics animation loop for swinging, inertia and oscillation
    function physicsLoop(){
      if (isDragging) return;

      var curSegLen = restLength / NUM_LINKS;
      var kSpring = 0.032;
      var damping = 0.945;
      var gravity = 0.42;

      // Update velocities and positions for free nodes
      for (var i = 1; i < NUM_POINTS; i++) {
        var p = points[i];
        var restTargetX = 40;
        var restTargetY = i * curSegLen;

        // Restorative spring toward vertical plumb-line
        var ax = (restTargetX - p.x) * kSpring;
        var ay = (restTargetY - p.y) * kSpring + gravity;

        // Slight wave propagation from adjacent links
        if (i > 1 && i < NUM_LINKS) {
          ax += (points[i - 1].x + points[i + 1].x - 2 * p.x) * 0.012;
        }

        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;

        p.x += p.vx;
        p.y += p.vy;
      }

      // Maintain chain length constraints
      solveConstraints(false);

      // Reconcile velocities with constraint positions
      for (var i = 1; i < NUM_POINTS; i++) {
        var p = points[i];
        p.vx = (p.x - p.oldX) * 0.92;
        p.vy = (p.y - p.oldY) * 0.92;
        p.oldX = p.x;
        p.oldY = p.y;
      }

      renderRope();

      // Check remaining energy to sleep when calm
      var totalEnergy = 0;
      for (var i = 1; i < NUM_POINTS; i++) {
        var p = points[i];
        var targetY = i * curSegLen;
        totalEnergy += Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.x - 40) + Math.abs(p.y - targetY);
      }

      if (totalEnergy > 0.15) {
        animFrame = requestAnimationFrame(physicsLoop);
      } else {
        // Settle cleanly to rest
        for (var i = 0; i < NUM_POINTS; i++) {
          points[i].x = 40;
          points[i].y = i * curSegLen;
          points[i].vx = 0;
          points[i].vy = 0;
          points[i].oldX = 40;
          points[i].oldY = i * curSegLen;
        }
        renderRope();
        animFrame = null;
      }
    }

    function startPhysics(){
      if (!animFrame) {
        // Record current old positions for Verlet momentum
        for (var i = 0; i < NUM_POINTS; i++) {
          points[i].oldX = points[i].x;
          points[i].oldY = points[i].y;
        }
        animFrame = requestAnimationFrame(physicsLoop);
      }
    }

    // Pointer Interaction (Grab, Drag & Swing the Batarang Chain)
    ropeHandle.addEventListener('pointerdown', function(e){
      e.preventDefault();
      isDragging = true;
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
      ropeHandle.setPointerCapture(e.pointerId);

      ptrStartX = e.clientX;
      ptrStartY = e.clientY;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      dragVelX = 0;
      dragVelY = 0;
    });

    window.addEventListener('pointermove', function(e){
      if (isDragging) {
        var anchor = getAnchorScreenPos();
        var rawX = e.clientX - anchor.x;
        var rawY = Math.max(40, e.clientY - anchor.y);

        // Flexible spring stretch limit
        var maxStretch = restLength * 1.65;
        var dist = Math.hypot(rawX, rawY);
        if (dist > maxStretch) {
          var excess = dist - maxStretch;
          var clamped = maxStretch + excess * 0.28;
          rawX = (rawX / dist) * clamped;
          rawY = (rawY / dist) * clamped;
        }

        dragVelX = (e.clientX - lastPtrX) * 0.75;
        dragVelY = (e.clientY - lastPtrY) * 0.75;
        lastPtrX = e.clientX;
        lastPtrY = e.clientY;

        dragTargetX = rawX;
        dragTargetY = rawY;

        // Realistic chain drape: add soft gravity sag to intermediate links
        for (var i = 1; i < NUM_LINKS; i++) {
          points[i].y += 1.35;
          // Apply proportional cursor drag momentum to chain body
          var t = i / NUM_LINKS;
          points[i].x += dragVelX * t * 0.25;
          points[i].y += dragVelY * t * 0.25;
        }

        solveConstraints(true);
        renderRope();
      } else {
        // Ambient breeze: nudge nearby links when cursor wanders near the chain
        var anchor = getAnchorScreenPos();
        var nearAny = false;
        for (var i = 1; i < NUM_POINTS; i++) {
          var nodeScreenX = anchor.x - 40 + points[i].x;
          var nodeScreenY = anchor.y + points[i].y;
          var dx = e.clientX - nodeScreenX;
          var dy = e.clientY - nodeScreenY;
          var dNear = Math.hypot(dx, dy);
          if (dNear < 85) {
            var push = (1 - dNear / 85) * 1.4;
            points[i].vx += (dx > 0 ? -1 : 1) * push;
            nearAny = true;
          }
        }
        if (nearAny && !animFrame) {
          startPhysics();
        }
      }
    });

    window.addEventListener('pointerup', function(e){
      if (isDragging) {
        isDragging = false;
        try { ropeHandle.releasePointerCapture(e.pointerId); } catch(err){}

        var pulledDown = dragTargetY - restLength;
        var draggedDist = Math.hypot(e.clientX - ptrStartX, e.clientY - ptrStartY);

        // Switch theme if pulled down past threshold or clicked
        if (pulledDown > 30 || draggedDist < 8) {
          toggleTheme();
          // Theme switch tactile rebound kick
          points[NUM_LINKS].vy += 6.5;
        }

        // Impart release inertia to all chain nodes
        points[NUM_LINKS].vx = dragVelX;
        points[NUM_LINKS].vy = dragVelY;
        for (var i = 1; i < NUM_LINKS; i++) {
          var t = i / NUM_LINKS;
          points[i].vx += dragVelX * t * 0.8;
          points[i].vy += dragVelY * t * 0.8;
        }

        startPhysics();
      }
    });

    window.addEventListener('resize', function(){
      restLength = Math.max(180, Math.min(window.innerHeight * 0.28, 240));
      segLen = restLength / NUM_LINKS;
      if (!isDragging) {
        for (var i = 0; i < NUM_POINTS; i++) {
          points[i].x = 40;
          points[i].y = i * segLen;
          points[i].vx = 0;
          points[i].vy = 0;
        }
        renderRope();
      }
    });

    // Initial render
    renderRope();
  }
  // ==========================================================================
  // JOURNEY & EXPERIENCE: TIME-TRAVEL YEAR ANIMATION & TIMELINE TRACKER
  // ==========================================================================
  var storySec=$('#story');
  if(storySec){
    var cards=$$('.story-card',storySec);
    var dateBadge=$('#story-date-badge');
    var currIdx=$('#story-curr-idx');
    var totalIdx=$('#story-total-idx');
    var meterFill=$('#story-meter-fill');
    var currentYearStr='2026';
    var activeCardEl=null;

    var storyTrack=$('.story-track', storySec);
    var storyDot=$('#story-dot', storySec);
    var storyRight=$('.story-right', storySec);
    var yearTrack=$('#year-track', storySec);

    if(totalIdx){
      totalIdx.textContent=(cards.length<10?'0':'')+cards.length;
    }

    function updateStoryDot(){
      if(!storyDot || !storyRight) return;
      var r = storyRight.getBoundingClientRect();
      var centerY = window.innerHeight * 0.5;
      var relY = centerY - r.top;
      // Clamp within story track height
      var clampedY = Math.max(0, Math.min(r.height, relY));
      storyDot.style.transform = 'translate3d(0, ' + clampedY.toFixed(1) + 'px, 0)';
    }

    function rollYear(yearStr){
      if(!yearStr || yearStr === currentYearStr) return;
      var oldYearStr = currentYearStr || '2026';
      currentYearStr = yearStr;
      var track = $('#year-track', storySec);
      if(!track) return;

      var goingBack = parseInt(yearStr, 10) < parseInt(oldYearStr, 10);
      
      // Clean up in-flight transitions
      while(track.children.length > 1){
        track.removeChild(track.lastChild);
      }
      var currentSpan = track.firstElementChild;
      if(currentSpan && currentSpan.textContent.trim() === yearStr) return;

      var newSpan = document.createElement('span');
      newSpan.className = 'year-val';
      newSpan.textContent = yearStr;

      if(goingBack){
        // Scrolling down (2026 -> 2025 -> 2022 -> 2021): new year enters from bottom
        track.appendChild(newSpan);
        track.style.transition = 'none';
        track.style.transform = 'translateY(0%)';

        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = 'translateY(-100%)';

            setTimeout(function(){
              if(track.contains(currentSpan)){
                track.removeChild(currentSpan);
              }
              track.style.transition = 'none';
              track.style.transform = 'none';
            }, 420);
          });
        });
      } else {
        // Scrolling back up: new year enters from top
        track.insertBefore(newSpan, currentSpan);
        track.style.transition = 'none';
        track.style.transform = 'translateY(-100%)';

        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = 'translateY(0%)';

            setTimeout(function(){
              while(track.children.length > 1){
                track.removeChild(track.lastChild);
              }
              track.style.transition = 'none';
              track.style.transform = 'none';
            }, 420);
          });
        });
      }
    }

    function activateCard(card){
      if(!card || card === activeCardEl) return;
      activeCardEl = card;
      cards.forEach(function(c){ c.classList.remove('active'); });
      card.classList.add('active');

      var y = card.dataset.year;
      var dates = card.dataset.dates;
      var idx = parseInt(card.dataset.index, 10);
      var total = cards.length;

      rollYear(y);
      if(dateBadge) dateBadge.textContent = dates;
      if(currIdx) currIdx.textContent = (idx < 10 ? '0' : '') + idx;
      if(totalIdx) totalIdx.textContent = (total < 10 ? '0' : '') + total;
      if(meterFill) meterFill.style.width = ((idx / total) * 100) + '%';
    }

    if(cards.length){
      activateCard(cards[0]);
    }
    updateStoryDot();

    var ticking = false;
    function checkActiveOnScroll(){
      updateStoryDot();
      var triggerY = window.innerHeight * 0.5;
      var closest = null;
      var closestDist = Infinity;
      cards.forEach(function(card){
        var rect = card.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var dist = Math.abs(center - triggerY);
        if(dist < closestDist){
          closestDist = dist;
          closest = card;
        }
      });
      if(closest && closest !== activeCardEl){
        activateCard(closest);
      }
      ticking = false;
    }

    window.addEventListener('scroll', function(){
      var rect = storySec.getBoundingClientRect();
      if(rect.bottom > -200 && rect.top < window.innerHeight + 200){
        if(!ticking){
          requestAnimationFrame(checkActiveOnScroll);
          ticking = true;
        }
      }
    }, {passive: true});

    window.addEventListener('resize', function(){
      updateStoryDot();
    });

    cards.forEach(function(card){
      card.addEventListener('click', function(){
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activateCard(card);
      });
    });
  }
  // ==========================================================================
  // Interactive Portrait Canvas Spotlight (B&W to Colour Radial Cursor Reveal)
  // Matching reference canvas implementation (#fig, #figBase, #figCanvas)
  // Only the area around the cursor changes smoothly to colour with feathered edge
  // ==========================================================================
  var fig = $('#fig') || $('.portrait-reveal');
  var figCanvas = $('#figCanvas');
  var figBase = $('#figBase') || (fig ? $('.img-bw', fig) : null);

  if (fig && figCanvas) {
    var ctx = figCanvas.getContext('2d');
    var colorImg = new Image();
    var imgLoaded = false;
    colorImg.onload = function() {
      imgLoaded = true;
      figCanvas.width = colorImg.naturalWidth || 900;
      figCanvas.height = colorImg.naturalHeight || 1130;
    };
    colorImg.src = 'assets/img/vasanth-cut-color.webp';

    var raf = null;
    var targetX = -999, targetY = -999;
    var currentX = -999, currentY = -999;
    var currentOpacity = 0;
    var targetOpacity = 0;
    var isActive = false;

    function renderCanvas() {
      // Smooth linear interpolation for cursor position
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;

      // Smooth crossfade opacity
      currentOpacity += (targetOpacity - currentOpacity) * 0.18;

      var w = figCanvas.width;
      var h = figCanvas.height;

      ctx.clearRect(0, 0, w, h);

      if (imgLoaded && currentOpacity > 0.008) {
        // Spotlight radius scaled to canvas dimensions (~300px on 900px canvas = ~150px on screen)
        var radius = Math.round(w * 0.34);

        ctx.save();
        // 1. Draw soft feathered radial gradient mask
        var grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, radius);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.35, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Composite color image strictly inside the feathered circle
        ctx.globalCompositeOperation = 'source-in';
        ctx.globalAlpha = Math.min(Math.max(currentOpacity, 0), 1);
        ctx.drawImage(colorImg, 0, 0, w, h);
        ctx.restore();
      }

      var moving = Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5;
      var fading = Math.abs(targetOpacity - currentOpacity) > 0.005;

      if (isActive || moving || fading) {
        raf = requestAnimationFrame(renderCanvas);
      } else {
        raf = null;
      }
    }

    function setCoords(clientX, clientY) {
      var rect = fig.getBoundingClientRect();
      var normX = (clientX - rect.left) / rect.width;
      var normY = (clientY - rect.top) / rect.height;
      targetX = normX * figCanvas.width;
      targetY = normY * figCanvas.height;
      if (currentX < -500) {
        currentX = targetX;
        currentY = targetY;
      }
    }

    function onPointerEnter(e) {
      isActive = true;
      targetOpacity = 1;
      fig.classList.add('is-active');
      setCoords(e.clientX, e.clientY);
      if (!raf) raf = requestAnimationFrame(renderCanvas);
    }

    function onPointerMove(e) {
      setCoords(e.clientX, e.clientY);
      if (!isActive) {
        isActive = true;
        targetOpacity = 1;
        fig.classList.add('is-active');
      }
      if (!raf) raf = requestAnimationFrame(renderCanvas);
    }

    function onPointerLeave() {
      isActive = false;
      targetOpacity = 0;
      fig.classList.remove('is-active');
      if (!raf) raf = requestAnimationFrame(renderCanvas);
    }

    var portraitWrap = fig.closest('.portrait') || fig;
    portraitWrap.addEventListener('pointerenter', onPointerEnter);
    portraitWrap.addEventListener('pointermove', onPointerMove);
    portraitWrap.addEventListener('pointerleave', onPointerLeave);
    portraitWrap.addEventListener('pointercancel', onPointerLeave);

    portraitWrap.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches[0]) {
        onPointerEnter(e.touches[0]);
      }
    }, {passive: true});

    portraitWrap.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0]);
      }
    }, {passive: true});

    portraitWrap.addEventListener('touchend', function() {
      setTimeout(onPointerLeave, 500);
    });
  }
})();
