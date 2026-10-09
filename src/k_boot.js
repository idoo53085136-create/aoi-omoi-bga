
async function fetchBin(name){ const r = await fetch(name); if (!r.ok) throw new Error('无法载入 ' + name); return await r.arrayBuffer(); }
function boot(){
  window.MISSING = Object.keys(IMG).filter(k => !IMG[k].width);   // r8: images that never loaded (export / jscheck refuse to go on)
  try { renderAt(0); } catch (e) { document.getElementById('err').textContent = String(e.message || e); window.ERR = String(e.stack || e); }
  window.READY = true;
  if (TEST){ document.getElementById('start').style.display = 'none'; document.getElementById('bar').style.display = 'none'; return; }
  let ac = null, buf = null, src = null, startAt = 0, offset = 0, playing = false;
  const seek = document.getElementById('seek'), tc = document.getElementById('tc'), pp = document.getElementById('pp');
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const now = () => playing ? ac.currentTime - startAt : offset;
  function play(at){ if (src){ try { src.stop(); } catch (e) {} } src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); startAt = ac.currentTime - at; src.start(0, at); playing = true; pp.textContent = '暂停'; }
  function pause(){ offset = now(); if (src){ try { src.stop(); } catch (e) {} } playing = false; pp.textContent = '播放'; }
  document.getElementById('start').onclick = async () => {
    const st = document.getElementById('start'); st.querySelector('span').textContent = '正在载入并解码音频…';
    ac = new (window.AudioContext || window.webkitAudioContext)();
    try { buf = await ac.decodeAudioData(await fetchBin('audio.mp4')); }
    catch (e) { st.querySelector('span').textContent = '音频无法解码：请换用最新版 Chrome 或 Edge'; return; }
    st.style.display = 'none'; play(0);
  };
  pp.onclick = () => { if (!ac) return; playing ? pause() : play(offset >= DUR ? 0 : offset); };
  seek.oninput = () => { const v = +seek.value; if (!ac){ offset = v; return; } playing ? play(v) : (offset = v); };
  document.getElementById('fs').onclick = () => { const w = document.getElementById('wrap'); document.fullscreenElement ? document.exitFullscreen() : w.requestFullscreen && w.requestFullscreen(); };
  addEventListener('keydown', e => { if (e.code === 'Space'){ e.preventDefault(); pp.onclick(); } });
  // if frames take too long on this machine, draw at a lower internal resolution (the page scales it up)
  let ftSum = 0, ftN = 0;
  (function loop(){ let t = ac ? now() : offset; if (t > DUR) t = DUR; if (playing && t >= DUR) pause(); const f0 = performance.now(); renderAt(t); const ft = performance.now() - f0;
    if (playing && !Q.get('w')){ ftSum += ft; ftN++; if (ftN >= 45){ const avg = ftSum / ftN; ftSum = 0; ftN = 0; if (avg > 22 && CW > 1280) setRes(1280); else if (avg > 22 && CW > 960) setRes(960); } } if (document.activeElement !== seek) seek.value = t.toFixed(2); tc.textContent = `${fmt(t)} / ${fmt(DUR)}`; requestAnimationFrame(loop); })();
}
loadAssets().then(boot);
