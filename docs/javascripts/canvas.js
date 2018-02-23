$(function() {
  var autoSelect, convertHex, reducedColor, toHex;
  if (!window.File || !window.FileReader) {
    alert('ブラウザが対応していません');
    return;
  }
  $('#upload_file').change(function() {
    var canvas, ctx, fr, image;
    if (!this.files.length) {
      alert('ファイルが選択されていません');
      return;
    }
    canvas = $('#left_canvas');
    ctx = canvas[0].getContext('2d');
    image = new Image;
    fr = new FileReader;
    fr.onload = function(e) {
      image.onload = function() {
        var canvasH, canvasW;
        canvasW = 400;
        canvasH = Math.floor(canvasW * image.naturalHeight / image.naturalWidth);
        canvas.attr('width', canvasW);
        canvas.attr('height', canvasH);
        ctx.drawImage(image, 0, 0, canvasW, canvasH);
        reducedColor(16);
        autoSelect();
      };
      image.src = e.target.result;
    };
    fr.readAsDataURL(this.files[0]);
  });
  $('#drop_zone').on('dragenter', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  $('#drop_zone').on('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  $('#drop_zone').on('drop', function(e) {
    var canvas, ctx, file, fr, image;
    e.preventDefault();
    file = e.originalEvent.dataTransfer.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert('拡張子jpg、png以外は対応していません');
      return;
    }
    canvas = $('#left_canvas');
    ctx = canvas[0].getContext('2d');
    image = new Image;
    fr = new FileReader;
    fr.onload = function(e) {
      image.onload = function() {
        var canvasH, canvasW;
        canvasW = 400;
        canvasH = Math.floor(canvasW * image.naturalHeight / image.naturalWidth);
        canvas.attr('width', canvasW);
        canvas.attr('height', canvasH);
        ctx.drawImage(image, 0, 0, canvasW, canvasH);
        reducedColor(16);
        autoSelect();
      };
      image.src = e.target.result;
    };
    fr.readAsDataURL(file);
  });
  reducedColor = function(num) {
    var canvasH, canvasW, colors, imagedata, leftCanvas, leftCtx, medianCut, rightCanvas, rightCtx;
    leftCanvas = $('#left_canvas');
    leftCtx = leftCanvas[0].getContext('2d');
    canvasW = leftCanvas.prop('width');
    canvasH = leftCanvas.prop('height');
    imagedata = leftCtx.getImageData(0, 0, canvasW, canvasH);
    colors = getColorInfo(imagedata);
    medianCut = new TMedianCut(imagedata, colors);
    medianCut.run(num, true);
    rightCanvas = $('#right_canvas');
    rightCanvas.attr('width', canvasW);
    rightCanvas.attr('height', canvasH);
    rightCtx = rightCanvas[0].getContext('2d');
    rightCtx.putImageData(imagedata, 0, 0);
  };
  $('#right_canvas').on({
    click: function(e) {
      var canvas, i, imagedata, mouseX, mouseY, rect, rgb, rightCtx;
      canvas = $('#right_canvas');
      rightCtx = canvas[0].getContext('2d');
      rect = canvas[0].getBoundingClientRect();
      mouseX = Math.round(e.clientX - rect.left);
      mouseY = Math.round(e.clientY - rect.top - ((400 - canvas[0].height) / 2));
      imagedata = rightCtx.getImageData(0, 0, canvas[0].width, canvas[0].height);
      i = (mouseY * canvas[0].width + mouseX) * 4;
      rgb = {
        r: imagedata.data[i],
        g: imagedata.data[i + 1],
        b: imagedata.data[i + 2]
      };
      console.log(convertHex(rgb) + ' => %ccolor', 'background-color: ' + convertHex(rgb));
    }
  });
  autoSelect = function() {
    var canvas, chart_cnt, chart_color, hex, hexOverlap, i, imagedata, key, max, rgb, rightCtx, sort, value;
    $('#left_canvas').css('background-image', 'none');
    canvas = $('#right_canvas');
    rightCtx = canvas[0].getContext('2d');
    imagedata = rightCtx.getImageData(0, 0, canvas[0].width, canvas[0].height);
    hex = [];
    max = imagedata.data.length / 4;
    i = 0;
    while (i < max) {
      rgb = {
        r: imagedata.data[i],
        g: imagedata.data[i + 1],
        b: imagedata.data[i + 2]
      };
      hex.push(convertHex(rgb));
      i += 4;
    }
    hexOverlap = hex.filter(function(v, i, s) {
      return s.indexOf(v) === i;
    });
    sort = [];
    for (key in hexOverlap) {
      value = hexOverlap[key];
      sort.push({
        color: value,
        cnt: hex.filter(function(v, i) {
          return v === value;
        }).length
      });
    }
    sort.sort(function(a, b) {
      if (a.cnt < b.cnt) {
        return 1;
      }
      if (a.cnt > b.cnt) {
        return -1;
      }
      return 0;
    });
    canvas = $('#chart_canvas');
    canvas.attr('width', 400);
    canvas.attr('height', 400);
    chart_color = sort.slice(0, 10).map(function(v) {
      return v.color;
    });
    chart_cnt = sort.slice(0, 10).map(function(v) {
      return v.cnt;
    });
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: chart_color,
        datasets: [
          {
            data: chart_cnt,
            backgroundColor: chart_color,
            borderColor: chart_color,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: false
      }
    });
  };
  convertHex = function(rgb) {
    return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
  };
  toHex = function(v) {
    return ('0' + v.toString(16)).substr(-2);
  };
});

//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FudmFzLmpzIiwic291cmNlcyI6WyJjYW52YXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUEsQ0FBRSxTQUFBO0FBRUEsTUFBQTtFQUFBLElBQUcsQ0FBQyxNQUFNLENBQUMsSUFBUixJQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUEzQjtJQUNFLEtBQUEsQ0FBTSxlQUFOO0FBQ0EsV0FGRjs7RUFLQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLE1BQWxCLENBQXlCLFNBQUE7QUFFdkIsUUFBQTtJQUFBLElBQUcsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVg7TUFDRSxLQUFBLENBQU0sZ0JBQU47QUFDQSxhQUZGOztJQUdBLE1BQUEsR0FBUyxDQUFBLENBQUUsY0FBRjtJQUNULEdBQUEsR0FBTSxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBVixDQUFxQixJQUFyQjtJQUNOLEtBQUEsR0FBUSxJQUFJO0lBQ1osRUFBQSxHQUFLLElBQUk7SUFFVCxFQUFFLENBQUMsTUFBSCxHQUFZLFNBQUMsQ0FBRDtNQUVWLEtBQUssQ0FBQyxNQUFOLEdBQWUsU0FBQTtBQUNiLFlBQUE7UUFBQSxPQUFBLEdBQVU7UUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFBLEdBQVUsS0FBSyxDQUFDLGFBQWhCLEdBQWdDLEtBQUssQ0FBQyxZQUFqRDtRQUNWLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixPQUFyQjtRQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixPQUF0QjtRQUVBLEdBQUcsQ0FBQyxTQUFKLENBQWMsS0FBZCxFQUFxQixDQUFyQixFQUF3QixDQUF4QixFQUEyQixPQUEzQixFQUFvQyxPQUFwQztRQUVBLFlBQUEsQ0FBYSxFQUFiO1FBRUEsVUFBQSxDQUFBO01BVmE7TUFZZixLQUFLLENBQUMsR0FBTixHQUFZLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFkWDtJQWdCWixFQUFFLENBQUMs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