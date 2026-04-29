// Live 2x2 payoff visualizer using Plotly
(function(){
  const ids = ['a00','a01','a10','a11'];
  const inputs = ids.map(id=>document.getElementById(id));
  const plotDiv = document.getElementById('plotly');
  const caseNote = document.getElementById('case-note');
  const presetButtons = Array.from(document.querySelectorAll('[data-preset]'));
  const AXIS_DELTA = 0.02; // small margin to avoid artifacts at exact 0/1 bounds

  const PRESETS = {
    'matching-pennies': [[1, -1], [-1, 1]],
    'saddle-point': [[4, 2], [3, 1]],
    'dominated': [[10, 10], [1, 1]],
    'default': [[3, 0], [5, 1]]
  };

  function setMatrix(A){
    inputs[0].value = A[0][0];
    inputs[1].value = A[0][1];
    inputs[2].value = A[1][0];
    inputs[3].value = A[1][1];
  }

  function readA(){
    const vals = inputs.map(i=>parseFloat(i.value));
    return [[vals[0]||0, vals[1]||0],[vals[2]||0, vals[3]||0]];
  }

  function computeZ(A, n=101, delta=AXIS_DELTA){
    const span = 1 - 2 * delta;
    const xVals = Array.from({length:n}, (_,i)=> delta + i * (span) / (n-1));
    const yVals = Array.from({length:n}, (_,i)=> delta + i * (span) / (n-1));
    const z = [];
    for(let yi=0; yi<yVals.length; yi++){
      const y = yVals[yi];
      const row = [];
      for(let xi=0; xi<xVals.length; xi++){
        const x = xVals[xi];
        // expected payoff = [x,1-x] * A * [y,1-y]
        const val = x*y*A[0][0] + x*(1-y)*A[0][1] + (1-x)*y*A[1][0] + (1-x)*(1-y)*A[1][1];
        row.push(val);
      }
      z.push(row);
    }
    return {x: xVals, y: yVals, z};
  }

  function computeNash(A){
    const a=A[0][0], b=A[0][1], c=A[1][0], d=A[1][1];
    const denom = (a - b - c + d);
    const eps = 1e-9;
    const result = {type: null, x:null, y:null, pure:[]};

    if(Math.abs(denom) > eps){
      const y_star = (d - b) / denom;
      const x_star = (d - c) / denom;
      if(x_star >= 0 && x_star <= 1 && y_star >= 0 && y_star <= 1){
        result.type = 'mixed'; result.x = x_star; result.y = y_star; return result;
      }
    }

    // check pure strategy Nash equilibria (corners)
    // For each pure profile (i,j): i in {0,1} is row choice, j in {0,1} is col choice
    for(let i=0;i<2;i++){
      for(let j=0;j<2;j++){
        // row best response to column j?
        const rowPay0 = A[0][j];
        const rowPay1 = A[1][j];
        const rowBest = (rowPay0 >= rowPay1) ? 0 : 1;
        // column best response to row i? column wants to minimize row payoff
        const colPay0 = A[i][0];
        const colPay1 = A[i][1];
        const colBest = (colPay0 <= colPay1) ? 0 : 1;
        if(rowBest === i && colBest === j){
          result.pure.push({x: i===0?1:0, y: j===0?1:0, profile:[i,j]});
        }
      }
    }
    if(result.pure.length>0) result.type='pure';
    else result.type='none';
    return result;
  }

  function bestResponses(A, samples=201){
    return bestResponsesInternal(A, samples, AXIS_DELTA);
  }

  function bestResponsesInternal(A, samples=201, delta=AXIS_DELTA){
    const span = 1 - 2 * delta;
    const yLine = Array.from({length:samples}, (_,i)=> delta + i * (span) / (samples-1));
    const xLine = Array.from({length:samples}, (_,i)=> delta + i * (span) / (samples-1));
    const a=A[0][0], b=A[0][1], c=A[1][0], d=A[1][1];
    const x_br = yLine.map(y=>{
      const diff = (a - c)*y + (b - d)*(1 - y);
      if(Math.abs(diff) < 1e-9) return 0.5;
      return diff > 0 ? 1 : 0;
    });
    const y_br = xLine.map(x=>{
      const diff = (a - b)*x + (c - d)*(1 - x);
      if(Math.abs(diff) < 1e-9) return 0.5;
      return diff > 0 ? 0 : 1;
    });
    return {yLine, x_br, xLine, y_br};
  }

  function nearlyEqual(a, b, eps = 1e-9){
    return Math.abs(a - b) <= eps;
  }

  function classifySpecialCase(A, nash){
    const a=A[0][0], b=A[0][1], c=A[1][0], d=A[1][1];

    if(nearlyEqual(a, 1) && nearlyEqual(b, -1) && nearlyEqual(c, -1) && nearlyEqual(d, 1)){
      return {
        title: 'Classic mixed strategy',
        message: 'Matching-pennies style game: neither pure strategy is stable, so the equilibrium is the mixed 1/2, 1/2 split.'
      };
    }

    if(nearlyEqual(a, 4) && nearlyEqual(b, 2) && nearlyEqual(c, 3) && nearlyEqual(d, 1)){
      return {
        title: 'Saddle point',
        message: 'This game has a pure-strategy saddle point, so both players can settle on a stable corner without randomizing.'
      };
    }

    if((a > c && b > d) || (c > a && d > b)){
      const dominatedRow = a > c && b > d ? 'Row 2' : 'Row 1';
      const dominantRow = a > c && b > d ? 'Row 1' : 'Row 2';
      return {
        title: 'Strictly dominated strategy',
        message: `${dominatedRow} is strictly dominated by ${dominantRow}, so the dominated row is never optimal.`
      };
    }

    if(nash.type === 'pure'){
      const profile = nash.pure[0];
      const reward = (profile.x * profile.y * a) + (profile.x * (1 - profile.y) * b) + ((1 - profile.x) * profile.y * c) + ((1 - profile.x) * (1 - profile.y) * d);
      return {
        title: 'Pure strategy equilibrium',
        message: `A stable corner solution exists at (${profile.profile[0]}, ${profile.profile[1]}), with expected payoff ${reward.toFixed(4)}.`
      };
    }

    return null;
  }

  function render(){
    const A = readA();
    const grid = computeZ(A, 121);
    const nash = computeNash(A);
    const br = bestResponsesInternal(A, 401, AXIS_DELTA);

    // Matplotlib 'bone'-like colorscale approximation
    const boneScale = [
      [0.0, '#000000'],
      [0.15, '#151515'],
      [0.35, '#373737'],
      [0.55, '#6e6e6e'],
      [0.75, '#b5b5b5'],
      [1.0, '#ffffff']
    ];

    const contour = {
      x: grid.x,
      y: grid.y,
      z: grid.z,
      type: 'contour',
      colorscale: boneScale,
      contours: {coloring: 'heatmap'},
      colorbar: {title: 'Expected payoff'}
    };

    const traces = [contour];

    // best response traces (step-like)
    traces.push({
      x: br.x_br,
      y: br.yLine,
      mode:'lines',
      line:{dash:'dash',color:'rgba(255,160,70,0.9)'},
      name:'Row best response',
      hoverinfo:'none'
    });

    traces.push({
      x: br.xLine,
      y: br.y_br,
      mode:'lines',
      line:{dash:'dot',color:'rgba(255,160,70,0.9)'},
      name:'Column best response',
      hoverinfo:'none'
    });

    // Nash markers
    if(nash.type === 'mixed'){
      traces.push({
        x:[nash.x], y:[nash.y], mode:'markers+text',
        marker:{symbol:'x-thin',size:14,color:'white'},
        name:'Mixed Nash', text:['(x*,y*)'], textposition:'top right'
      });
    } else if(nash.type === 'pure'){
      const px = nash.pure.map(p=>p.x);
      const py = nash.pure.map(p=>p.y);
      traces.push({x:px,y:py,mode:'markers+text',marker:{size:10,color:'white'},name:'Pure NE',text:nash.pure.map(p=>`(${p.profile[0]},${p.profile[1]})`),textposition:'top right'});
    }

    const layout = {
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      font:{color:'#e6eef6'},
      xaxis:{title:'Row strategy x (prob row 1)', range:[AXIS_DELTA, 1-AXIS_DELTA]},
      yaxis:{title:'Column strategy y (prob col 1)', range:[AXIS_DELTA, 1-AXIS_DELTA]},
      margin:{l:60,r:20,t:40,b:60},
      legend:{x:0.02, y:0.98, xanchor:'left', yanchor:'top', bgcolor:'rgba(0,0,0,0.15)'}
    };

    Plotly.react(plotDiv, traces, layout, {responsive:true});

    // update info panel below matrix
    const infoBody = document.getElementById('info-body');
    function payoff(A,x,y){
      return x*y*A[0][0] + x*(1-y)*A[0][1] + (1-x)*y*A[1][0] + (1-x)*(1-y)*A[1][1];
    }

    let infoHtml = '';
    if(nash.type === 'mixed'){
      const val = payoff(A, nash.x, nash.y);
      infoHtml += `<div>Type: <strong>Mixed strategy</strong></div>`;
      infoHtml += `<div>Row probability x*: <strong>${nash.x.toFixed(4)}</strong></div>`;
      infoHtml += `<div>Column probability y*: <strong>${nash.y.toFixed(4)}</strong></div>`;
      infoHtml += `<div>Expected payoff at (x*,y*): <strong>${val.toFixed(4)}</strong></div>`;
    } else if(nash.type === 'pure'){
      infoHtml += `<div>Type: <strong>Pure strategy</strong></div>`;
      nash.pure.forEach((p,i)=>{
        const val = payoff(A, p.x, p.y);
        infoHtml += `<div>Profile ${i+1}: Row=${p.profile[0]} Col=${p.profile[1]} → payoff <strong>${val.toFixed(4)}</strong></div>`;
      });
    } else {
      infoHtml += `<div>Type: <strong>No equilibrium in unit square</strong></div>`;
      // Provide best pure responses payoffs for reference
      const corners = [ [1,1],[1,0],[0,1],[0,0] ];
      infoHtml += `<div style="margin-top:6px"><em>Corner payoffs</em></div>`;
      corners.forEach(c=>{
        const v = payoff(A, c[0], c[1]);
        infoHtml += `<div>Row=${c[0]} Col=${c[1]} → payoff <strong>${v.toFixed(4)}</strong></div>`;
      });
    }
    if(infoBody) infoBody.innerHTML = infoHtml;

    const specialCase = classifySpecialCase(A, nash);
    if(caseNote){
      if(specialCase){
        caseNote.hidden = false;
        caseNote.innerHTML = `<strong>${specialCase.title}</strong><div>${specialCase.message}</div>`;
      } else {
        caseNote.hidden = true;
        caseNote.innerHTML = '';
      }
    }
  }

  // hook events
  inputs.forEach(i=>i.addEventListener('input', ()=>{
    render();
  }));

  presetButtons.forEach(button=>{
    button.addEventListener('click', ()=>{
      const preset = PRESETS[button.dataset.preset];
      if(preset){
        setMatrix(preset);
        render();
      }
    });
  });

  // initial render
  document.addEventListener('DOMContentLoaded', ()=>{
    render();
  });
  // also render now in case script deferred and DOM ready
  if(document.readyState!=='loading') render();

})();
