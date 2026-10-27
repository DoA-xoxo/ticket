'use client';

import React, { ChangeEvent, useCallback, useEffect, useId, useRef, useState } from 'react';

type TicketDesign = {
  scale: number;
  offsetX: number;
  offsetY: number;
  name: string;
  nameFont: string;
  photoDataUrl: string | null;
  photoScale: number;
  photoX: number;
  photoY: number;
  ticketColor: string;
  inkColor: string;
  textColor: string;
  accentColor: string;
  canvasColor: string;
  transparentBackground: boolean;
  fontWeight: 400 | 700;
    // 새로 추가
  backgroundImageDataUrl: string | null;
  ticketOpacity: number;
  photoOpacity: number;
  photoOpacity: 1,
};

const INITIAL_DESIGN: TicketDesign = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  name: 'TICKET HOLDER',
  nameFont: 'var(--font-noto-serif), serif',
  fontWeight: 700,
  photoDataUrl: null,
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  ticketColor: '#f4ecde',
  inkColor: '#503d32',
  textColor: '#503d32',
  accentColor: '#aa8a61',
  canvasColor: '#f3eee6',
  transparentBackground: false,
  backgroundImageDataUrl: null,
  ticketOpacity: 1,
};




const NAME_FONTS = [
  {
    label: '명조',
    value: 'var(--font-noto-serif), serif',
  },
  {
    label: '클래식 명조',
    value: 'var(--font-nanum-myeongjo), serif',
  },
  {
    label: '깔끔한 고딕',
    value: 'var(--font-noto-sans), sans-serif',
  },
  {
    label: '둥근 느낌의 고딕',
    value: 'var(--font-nanum-gothic), sans-serif',
  },
  {
    label: '손글씨',
    value: 'var(--font-nanum-pen), cursive',
  },
];



// All four sides are part of one die-cut contour. The inner rules use the same
// path generator at inset dimensions, so the scallops follow the silhouette.



function makeStampPath(inset = 0) {
  const width = 400;
  const height = 800;
  const scallops = 9;
  const sideY = 632;
  const outerRadius = 20;

  // 바깥쪽 외곽선: 기존 물결 모양 그대로 유지
  if (inset === 0) {
    const depth = 16;
    const step = width / scallops;
    const baseRx = step * 0.34;
    let path = `M 0 ${depth} L 0 ${sideY - outerRadius}`;

    path += ` A 20 20 0 0 1 20 ${sideY}`;
    path += ` A 20 20 0 0 1 0 ${sideY + outerRadius}`;
    path += ` L 0 ${height - depth} L 0 ${height}`;

    for (let i = 0; i < scallops; i++) {
      const center = (i + 0.5) * step;
      const radius = baseRx;
      path += ` L ${center - radius} ${height}`;
      path += ` A ${radius} ${depth} 0 0 1 ${center + radius} ${height}`;
    }

    path += ` L ${width} ${height}`;
    path += ` L ${width} ${sideY + outerRadius}`;
    path += ` A 20 20 0 0 1 ${width - 20} ${sideY}`;
    path += ` A 20 20 0 0 1 ${width} ${sideY - outerRadius}`;
    path += ` L ${width} ${depth} L ${width} 0`;

    for (let i = scallops - 1; i >= 0; i--) {
      const center = (i + 0.5) * step;
      const radius = baseRx;
      path += ` L ${center + radius} 0`;
      path += ` A ${radius} ${depth} 0 0 1 ${center - radius} 0`;
    }

    path += ` L 0 0`;
    return `${path} Z`;
  }

  // 안쪽 테두리: 위아래는 직선, 좌우 반원
  const left = inset;
  const right = width - inset;
  const top = inset + 13;
  const bottom = height - inset - 13;
  const radius = Math.max(1, outerRadius - inset + 16);

  // 반원의 깊이: 숫자가 작을수록 바깥쪽에 가깝고 얕아짐
  const curveDepth = 28;

  // 반원의 위아래 높이
  const curveHeight = radius + 6;

  const curveTop = sideY - curveHeight;
  const curveBottom = sideY + curveHeight;

  let path = `M ${left} ${top}`;
  path += ` L ${left} ${curveTop}`;

  // 왼쪽 곡선: 가장 안쪽으로 들어가는 깊이를 curveDepth로 조절
  path += ` C ${left + curveDepth} ${curveTop}, ${left + curveDepth} ${curveBottom}, ${left} ${curveBottom}`;

  path += ` L ${left} ${bottom}`;
  path += ` L ${right} ${bottom}`;
  path += ` L ${right} ${curveBottom}`;

  // 오른쪽 곡선
  path += ` C ${right - curveDepth} ${curveBottom}, ${right - curveDepth} ${curveTop}, ${right} ${curveTop}`;

  path += ` L ${right} ${top}`;
  path += ` Z`;

  return path;
}




function TicketArtwork({ design, svgRef }: { design: TicketDesign; svgRef?: React.Ref<SVGSVGElement> }) {
  const uid = useId().replace(/:/g, '');
  const photoClipId = `photo-clip-${uid}`;
  const logoTintId = `logo-tint-${uid}`;
  const outer = makeStampPath(0);
  const inner = makeStampPath(13);
  const nameSize = Math.min(27, Math.max(16, 340 / Math.max(design.name.trim().length * 0.62, 1)));
  const photoX = 44;
  const photoY = 170;
  const photoW = 312;
  const photoH = 412;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      role="img"
      aria-label="The Nutcracker custom ticket preview"
    >
      <defs>
        <clipPath id={photoClipId}>
          <rect x={photoX} y={photoY} width={photoW} height={photoH} />
        </clipPath>
        <filter id={logoTintId} colorInterpolationFilters="sRGB">
          <feFlood floodColor={design.textColor} result="logo-tint" />
          <feComposite in="logo-tint" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>

      {!design.transparentBackground && <rect data-canvas-background="true" width="1000" height="1000" fill={design.canvasColor} />}
      {design.backgroundImageDataUrl && (
        <image
          data-background-image="true"
          href={design.backgroundImageDataUrl}
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="xMidYMid slice"
        />
      )}

      <g transform={`translate(${500 + design.offsetX} ${500 + design.offsetY}) scale(${design.scale}) translate(-200 -400)`}>
        <path d={outer} fill={design.ticketColor} fillOpacity={design.ticketOpacity ?? 1} stroke={design.inkColor} strokeWidth="2.8" strokeLinejoin="round" />
        <path d={inner} fill="none" stroke={design.accentColor} strokeWidth="1.5" strokeLinejoin="round" />

        {/* The title is a separate, transparent logo image rather than editable text. */}
        <image data-logo-image="true" href="/the-nutcracker-logo1.png" x="40" y="56" width="320" height="104" preserveAspectRatio="xMidYMid meet" filter={`url(#${logoTintId})`} />

        {/* One simple photo window; the uploaded picture replaces only this area. */}
        <g clipPath={`url(#${photoClipId})`}>
          {design.photoDataUrl ? (
            <g transform={`translate(${200 + design.photoX} ${photoY + photoH / 2 + design.photoY}) scale(${design.photoScale}) translate(-200 ${-(photoY + photoH / 2)})`}>
              <image
                href={design.photoDataUrl}
                x={photoX}
                y={photoY}
                width={photoW}
                height={photoH}
                preserveAspectRatio="xMidY slice"
                opacity={design.photoOpacity ?? 1}
                />

            </g>
          ) : (
            <g>
              <rect x={photoX} y={photoY} width={photoW} height={photoH} fill="#F8F1E6" />
              <rect x={photoX + 13} y={photoY + 13} width={photoW - 26} height={photoH - 26} fill="none" stroke={design.accentColor} strokeWidth="1.2" strokeDasharray="4 6" />
              <g transform={`translate(200 ${photoY + photoH / 2 - 18})`} fill="none" stroke={design.inkColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="-24" y="-17" width="48" height="34" rx="4" />
                <circle cx="0" cy="0" r="8" />
                <path d="M-15 -17 L-9 -25 L5 -25 L11 -17" />
              </g>
              <text x="200" y={photoY + photoH / 2 + 37} textAnchor="middle" fill={design.inkColor} fontFamily="Georgia, serif" fontSize="12" letterSpacing="2.2">ADD YOUR IMAGE</text>
              <text x="200" y={photoY + photoH / 2 + 58} textAnchor="middle" fill="#785c55" fontFamily="Georgia, serif" fontSize="10" letterSpacing="1.2">CHOOSE A PHOTO</text>
            </g>
          )}
        </g>
        <rect x={photoX} y={photoY} width={photoW} height={photoH} fill="none" stroke={design.inkColor} strokeWidth="1.5" />

        {/* Printed perforation line near the lower ticket section. */}
        <line x1="40" y1="633" x2="360" y2="633" stroke={design.inkColor} strokeWidth="1.5" strokeDasharray="4 5" />
        <text x="200" y="658" textAnchor="middle" fill={design.textColor} fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" letterSpacing="3.2">TICKET HOLDER</text>
        <text x="200" y="704" textAnchor="middle" fill={design.textColor} fontFamily={design.nameFont} fontSize={nameSize} fontWeight={design.fontWeight}>{design.name || ' '}</text>
        <line x1="68" y1="730" x2="332" y2="730" stroke={design.accentColor} strokeWidth="1" />
        <text x="200" y="752" textAnchor="middle" fill={design.textColor} fontFamily="Georgia, serif" fontSize="10" letterSpacing="2.4">THE NUTCRACKER · HODO THEATER</text>
      </g>
    </svg>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('이미지를 읽지 못했습니다.'));
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error('로고 이미지를 불러오지 못했습니다.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('로고를 변환하지 못했습니다.'));
    reader.onerror = () => reject(new Error('로고를 변환하지 못했습니다.'));
    reader.readAsDataURL(blob);
  });
}

export default function Home() {
  const [design, setDesign] = useState<TicketDesign>(INITIAL_DESIGN);
  const [toast, setToast] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((patch: Partial<TicketDesign>) => {
    setDesign((current) => ({ ...current, ...patch }));
  }, []);

  const resetDesign = useCallback(() => {
    setDesign(INITIAL_DESIGN);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (backgroundFileInputRef.current) backgroundFileInputRef.current.value = '';
    setToast('티켓을 초기 상태로 되돌렸어요.');
    window.setTimeout(() => setToast(''), 2200);
  }, []);

  const onPhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    if (!file.type.startsWith('image/')) {
      setToast('이미지 파일을 선택해 주세요.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      update({ photoDataUrl: dataUrl, photoScale: 1, photoX: 0, photoY: 0 });
      setToast('사진을 티켓에 적용했어요.');
    } catch {
      setToast('사진을 불러오지 못했습니다.');
    }
    window.setTimeout(() => setToast(''), 2200);
  };

  const downloadPng = useCallback(async () => {
    if (!svgRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      await document.fonts.ready;
      const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '1600');
      clone.setAttribute('height', '1600');
      const logo = clone.querySelector('image[data-logo-image="true"]');
      if (logo) {
        const href = logo.getAttribute('href');
        if (href) logo.setAttribute('href', await urlToDataUrl(new URL(href, window.location.href).href));
      }
      const svgText = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      try {
        const image = new Image();
        image.decoding = 'async';
        image.src = svgUrl;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1600;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('이미지를 내보낼 수 없습니다.');
        context.drawImage(image, 0, 0, 1600, 1600);
        const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG 생성에 실패했습니다.')), 'image/png'));
        const downloadUrl = URL.createObjectURL(png);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'the-nutcracker-ticket.png';
        link.click();
        URL.revokeObjectURL(downloadUrl);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
      setToast('1600 × 1600px PNG를 저장했어요.');
    } catch (error) {
      console.error(error);
      setToast('다운로드에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDownloading(false);
      window.setTimeout(() => setToast(''), 2600);
    }
  }, [isDownloading]);

  const xLimit = Math.max(0, Math.floor((1000 - 400 * design.scale) / 2) - 10);
  const yLimit = Math.max(0, Math.floor((1000 - 800 * design.scale) / 2) - 10);
  const colorPresets = [
    { label: '로즈', ticket: '#e4aab5', ink: '#a52d32', text: '#a52d32', accent: '#bd6566' },
    { label: '아이보리', ticket: '#f4ecde', ink: '#503d32', text: '#503d32', accent: '#aa8a61' },
    { label: '크림슨', ticket: '#f4e9df', ink: '#9c252d', text: '#9c252d', accent: '#bd4548' },
    { label: '파우더 블루', ticket: '#c8dce6', ink: '#304d65', text: '#304d65', accent: '#698fa5' },
    { label: '민트', ticket: '#d5e4d5', ink: '#46644e', text: '#46644e', accent: '#829c7e' },
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-kicker">THE HODO THEATER · TICKET STUDIO</div>
          <div className="brand-logo"><img src="/the-nutcracker-logo.png" alt="The Nutcracker" /></div>
          <p>나만의 기념 티켓을 만들어 보세요.</p>
        </div>
        <div className="top-actions">
          <button className="button button-light" type="button" onClick={resetDesign}><span aria-hidden="true">↺</span> 초기화</button>
          <button className="button button-light" type="button" onClick={() => setPreviewOpen(true)}><span aria-hidden="true">◉</span> 최종 미리보기</button>
          <button className="button button-primary" type="button" onClick={downloadPng} disabled={isDownloading}><span aria-hidden="true">↓</span> {isDownloading ? '이미지 생성 중…' : 'PNG 다운로드'}</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="controls-card">
          <div className="card-heading">
            <span className="heading-icon">✳</span>
            <div><h2>티켓 설정</h2><p>필요한 정보만 간단하게 편집하세요.</p></div>
          </div>

          <section className="control-section">
            <div className="section-heading"><span>01 · 크기와 위치</span><small>비율 고정</small></div>
            <label className="range-field">
              <span className="range-label"><span>티켓 크기</span><strong>{Math.round(design.scale * 100)}%</strong></span>
              <input type="range" min="80" max="120" step="1" value={Math.round(design.scale * 100)} onChange={(e) => update({ scale: Number(e.target.value) / 100, offsetX: 0, offsetY: 0 })} />
              <span className="range-ends"><span>80%</span><span>120%</span></span>
            </label>
            <p className="helper">크기를 바꾸면 티켓이 자동으로 중앙에 정렬됩니다.</p>
            <label className="range-field position-field">
              <span className="range-label"><span>좌우 위치</span><strong>{design.offsetX > 0 ? '+' : ''}{design.offsetX}px</strong></span>
              <input type="range" min={-xLimit} max={xLimit} step="1" value={design.offsetX} onChange={(e) => update({ offsetX: Number(e.target.value) })} />
              <span className="range-ends"><span>왼쪽</span><span>오른쪽</span></span>
            </label>
            <label className="range-field">
              <span className="range-label"><span>상하 위치</span><strong>{design.offsetY > 0 ? '+' : ''}{design.offsetY}px</strong></span>
              <input type="range" min={-yLimit} max={yLimit} step="1" value={design.offsetY} onChange={(e) => update({ offsetY: Number(e.target.value) })} />
              <span className="range-ends"><span>위</span><span>아래</span></span>
            </label>
            <button className="button button-secondary button-full" type="button" onClick={() => update({ offsetX: 0, offsetY: 0 })}>↔ 위치 중앙 정렬</button>
          </section>


<section className="control-section">
  <div className="section-heading">
    <span>02 · 중앙 이미지</span>
    <small>기기에서만 처리</small>
  </div>

  <input
    ref={fileInputRef}
    className="visually-hidden"
    type="file"
    accept="image/*"
    onChange={onPhotoChange}
  />

  <div className="background-image-control">
    <label className="form-label">중앙 이미지</label>

    <button
      className="button button-secondary button-full"
      type="button"
      onClick={() => fileInputRef.current?.click()}
    >
      {design.photoDataUrl ? '중앙 이미지 교체' : '중앙 이미지 선택'}
    </button>

    {design.photoDataUrl && (
      <button
        className="text-button remove-photo"
        type="button"
        onClick={() => {
          update({
            photoDataUrl: null,
            photoScale: 1,
            photoX: 0,
            photoY: 0,
            photoOpacity: 1
          });

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        중앙 이미지 삭제
      </button>
    )}
  </div>

  {design.photoDataUrl && (
    <>
      <label className="range-field photo-range">
        <span className="range-label">
          <span>중앙 이미지 투명도</span>
          <strong>
            {Math.round((design.photoOpacity ?? 1) * 100)}%
          </strong>
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={design.photoOpacity ?? 1}
          onChange={(e) =>
            update({
              photoOpacity: Number(e.target.value)
            })
          }
        />

        <span className="range-ends">
          <span>투명</span>
          <span>불투명</span>
        </span>
      </label>

      <label className="range-field photo-range">
        <span className="range-label">
          <span>사진 확대</span>
          <strong>
            {Math.round(design.photoScale * 100)}%
          </strong>
        </span>

        <input
          type="range"
          min="100"
          max="240"
          step="1"
          value={Math.round(design.photoScale * 100)}
          onChange={(e) =>
            update({
              photoScale: Number(e.target.value) / 100
            })
          }
        />
      </label>

      <label className="range-field photo-range">
        <span className="range-label">
          <span>사진 가로 위치</span>
          <strong>
            {design.photoX > 0 ? '+' : ''}
            {design.photoX}px
          </strong>
        </span>

        <input
          type="range"
          min="-100"
          max="100"
          step="1"
          value={design.photoX}
          onChange={(e) =>
            update({
              photoX: Number(e.target.value)
            })
          }
        />
      </label>

      <label className="range-field photo-range">
        <span className="range-label">
          <span>사진 세로 위치</span>
          <strong>
            {design.photoY > 0 ? '+' : ''}
            {design.photoY}px
          </strong>
        </span>

        <input
          type="range"
          min="-120"
          max="120"
          step="1"
          value={design.photoY}
          onChange={(e) =>
            update({
              photoY: Number(e.target.value)
            })
          }
        />
      </label>

      <button
        className="button button-secondary button-full"
        type="button"
        onClick={() =>
          update({
            photoScale: 1,
            photoX: 0,
            photoY: 0,
            photoOpacity: 1
          })
        }
      >
        사진 설정 초기화
      </button>
    </>
  )}
</section>

    
<section className="control-section">
  <div className="section-heading">
    <span>03 · 예매자 이름</span>
    <small>텍스트 편집</small>
  </div>

  <label className="form-label" htmlFor="ticket-name">
    티켓에 표시할 이름
  </label>
  <input
    id="ticket-name"
    className="text-input"
    type="text"
    maxLength={32}
    value={design.name}
    onChange={(e) => update({ name: e.target.value })}
    placeholder="이름을 입력하세요"
  />

  <label className="form-label spaced-label" htmlFor="name-font">
    이름 글꼴
  </label>
  <select
    id="name-font"
    className="select-input"
    value={design.nameFont}
    onChange={(e) => update({ nameFont: e.target.value })}
  >
    {NAME_FONTS.map((font) => (
      <option key={font.label} value={font.value}>
        {font.label}
      </option>
    ))}
  </select>

  <label className="form-label spaced-label" htmlFor="name-font-weight">
    글씨 굵기
  </label>
  <select
    id="name-font-weight"
    className="select-input"
    value={design.fontWeight}
    onChange={(e) =>
      update({
        fontWeight: Number(e.target.value) as 400 | 700,
      })
    }
  >
    <option value={400}>보통</option>
    <option value={700}>굵게</option>
  </select>
</section>


          <section className="control-section">
            <div className="section-heading"><span>04 · 색상</span><small>자유롭게 변경</small></div>
            <div className="palette-row">
              {colorPresets.map((preset) => (
                <button key={preset.label} type="button" className={`palette-choice ${design.ticketColor === preset.ticket && design.inkColor === preset.ink && design.textColor === preset.text && design.accentColor === preset.accent ? 'selected' : ''}`} onClick={() => update({ ticketColor: preset.ticket, inkColor: preset.ink, textColor: preset.text, accentColor: preset.accent })} aria-label={`${preset.label} 색상 적용`}>
                  <span style={{ backgroundColor: preset.ticket }} /><small>{preset.label}</small>
                </button>
              ))}
            </div>
            <ColorField label="티켓 바탕색" value={design.ticketColor} onChange={(ticketColor) => update({ ticketColor })} />
            <ColorField label="티켓 외곽선" value={design.inkColor} onChange={(inkColor) => update({ inkColor })} />
            <ColorField label="글씨·로고 색상" value={design.textColor} onChange={(textColor) => update({ textColor })} />
            <ColorField label="안쪽 선·절취선" value={design.accentColor} onChange={(accentColor) => update({ accentColor })} />
            <ColorField label="캔버스 배경" value={design.canvasColor} onChange={(canvasColor) => update({ canvasColor })} />

            <div className="background-image-control">
              <label className="form-label">배경 이미지</label>
              <input
                ref={backgroundFileInputRef}
                className="visually-hidden"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith('image/')) {
                    setToast('이미지 파일을 선택해 주세요.');
                    window.setTimeout(() => setToast(''), 2200);
                    return;
                  }
                  try {
                    const dataUrl = await readFileAsDataUrl(file);
                    update({ backgroundImageDataUrl: dataUrl });
                    setToast('배경 이미지를 적용했어요.');
                  } catch {
                    setToast('배경 이미지를 불러오지 못했습니다.');
                  }
                  window.setTimeout(() => setToast(''), 2200);
                }}
              />
              <button className="button button-secondary button-full" type="button" onClick={() => backgroundFileInputRef.current?.click()}>
                {design.backgroundImageDataUrl ? '배경 이미지 교체' : '배경 이미지 선택'}
              </button>
              {design.backgroundImageDataUrl && (
                <button
                  className="text-button remove-photo"
                  type="button"
                  onClick={() => {
                    update({ backgroundImageDataUrl: null });
                    if (backgroundFileInputRef.current) backgroundFileInputRef.current.value = '';
                  }}
                >
                  배경 이미지 삭제
                </button>
              )}
            </div>

            <label className="range-field">
              <span className="range-label"><span>티켓 배경 투명도</span><strong>{Math.round((design.ticketOpacity ?? 1) * 100)}%</strong></span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={design.ticketOpacity ?? 1}
                onChange={(e) => update({ ticketOpacity: Number(e.target.value) })}
              />
              <span className="range-ends"><span>투명</span><span>불투명</span></span>
            </label>

            <label className="checkbox-row"><input type="checkbox" checked={design.transparentBackground} onChange={(e) => update({ transparentBackground: e.target.checked })} /> 투명 배경으로 PNG 저장</label>
          </section>

          <div className="privacy-note"><span aria-hidden="true">◇</span><p>사진은 이 브라우저 안에서만 처리하며 서버에 업로드하지 않습니다.</p></div>
        </aside>

        <section className="preview-card">
          <div className="preview-heading">
            <div><div className="eyebrow">YOUR INVITATION</div><h2>티켓 미리보기</h2><p>편집한 내용이 즉시 반영됩니다.</p></div>
            <div className="canvas-spec"><span className="live-dot" /> 1600 × 1600px <b>PNG</b></div>
          </div>
          <div className={`artboard ${design.transparentBackground ? 'checkerboard' : ''}`} style={!design.transparentBackground ? { backgroundColor: design.canvasColor } : undefined}>
            <TicketArtwork design={design} svgRef={svgRef} />
          </div>
          <div className="preview-footer"><span>✦ THE NUTCRACKER · HODO THEATER</span><span>미리보기는 다운로드 결과와 같은 비율로 표시됩니다.</span></div>
          <div className="preview-bottom-actions">
            <button className="button button-secondary" type="button" onClick={() => setPreviewOpen(true)}>최종 미리보기 열기 ↗</button>
            <button className="button button-primary" type="button" onClick={downloadPng} disabled={isDownloading}>↓ {isDownloading ? '이미지 생성 중…' : 'PNG 다운로드'}</button>
          </div>
        </section>
      </div>

      <footer className="site-footer"><span>THE NUTCRACKER · TICKET STUDIO</span><span>Made for your winter memory</span></footer>

      {previewOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}>
        <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="final-preview-title">
          <div className="modal-heading"><div><div className="eyebrow">FINAL CHECK</div><h2 id="final-preview-title">다운로드 전 최종 미리보기</h2><p>실제 PNG와 동일한 정사각형 비율입니다.</p></div><button className="close-button" type="button" onClick={() => setPreviewOpen(false)} aria-label="미리보기 닫기">×</button></div>
          <div className={`modal-artboard ${design.transparentBackground ? 'checkerboard' : ''}`} style={!design.transparentBackground ? { backgroundColor: design.canvasColor } : undefined}><TicketArtwork design={design} /></div>
          <div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setPreviewOpen(false)}>계속 편집</button><button className="button button-primary" type="button" onClick={downloadPng} disabled={isDownloading}>↓ PNG 다운로드</button></div>
        </section>
      </div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  useEffect(() => setDraft(value.toUpperCase()), [value]);
  return <label className="color-field"><span>{label}</span><span className="color-entry"><input aria-label={`${label} 색상`} type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input className="hex-input" type="text" value={draft} maxLength={7} onChange={(e) => { const next = e.target.value.toUpperCase(); setDraft(next); if (/^#[0-9A-F]{6}$/.test(next)) onChange(next); }} onBlur={() => setDraft(value.toUpperCase())} /></span></label>;
}
