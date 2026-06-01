import { html } from 'satori-html'
import type { GithubStats } from '$lib/github/models/github-stats'
import { formatNumber } from '$lib/core/formatting/number-formatting'

export function generateOgHtml(
  statistics: GithubStats,
  username: string,
  pieSlicesHtml: string,
  barsHtml: string,
): ReturnType<typeof html> {
  const displayName = statistics.displayName || username

  return html(`
    <div style="
      display: flex;
      flex-direction: row;
      width: 1200px;
      height: 630px;
      background-color: #191724;
      color: #e0def4;
      font-family: 'JetBrains Mono', 'Noto Sans JP', monospace;
      padding: 40px;
      box-sizing: border-box;
      justify-content: space-between;
    ">

      <div style="
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 670px;
        height: 550px;
      ">

        <div style="
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 24px;
          background-color: #1f1d2e;
          border: 1px solid #403d52;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 16px 32px rgba(0,0,0,0.3);
        ">
          <img
            src="${statistics.avatarUrl}"
            style="
              width: 100px;
              height: 100px;
              border-radius: 20px;
              border: 3px solid #c4a7e7;
            "
          />
          <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 480px;
          ">
            <div style="
              display: flex;
              font-family: 'Instrument Serif', 'Noto Sans JP';
              font-size: 52px;
              line-height: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              color: #e0def4;
            ">
              ${displayName}
            </div>
            <div style="
              display: flex;
              font-size: 20px;
              color: #908caa;
              margin-top: 8px;
            ">@${username}</div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%;">
          <div style="
            display: flex;
            flex-direction: column;
            background-color: #1f1d2e;
            border: 1px solid #403d52;
            border-top: 4px solid #9ccfd8;
            border-radius: 16px;
            width: 327px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          ">
            <span style="
              font-size: 13px;
              color: #908caa;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">Contributions</span>
            <span style="
              font-family: 'Instrument Serif';
              font-size: 48px;
              color: #e0def4;
              margin-top: 4px;
            ">${formatNumber(statistics.totalContributions)}</span>
          </div>

          <div style="
            display: flex;
            flex-direction: column;
            background-color: #1f1d2e;
            border: 1px solid #403d52;
            border-top: 4px solid #c4a7e7;
            border-radius: 16px;
            width: 327px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          ">
            <span style="
              font-size: 13px;
              color: #908caa;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">Commits</span>
            <span style="
              font-family: 'Instrument Serif';
              font-size: 48px;
              color: #e0def4;
              margin-top: 4px;
            ">${formatNumber(statistics.totalCommits)}</span>
          </div>

          <div style="
            display: flex;
            flex-direction: column;
            background-color: #1f1d2e;
            border: 1px solid #403d52;
            border-top: 4px solid #f6c177;
            border-radius: 16px;
            width: 327px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          ">
            <span style="
              font-size: 13px;
              color: #908caa;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">Stars</span>
            <span style="
              font-family: 'Instrument Serif';
              font-size: 48px;
              color: #e0def4;
              margin-top: 4px;
            ">${formatNumber(statistics.totalStars)}</span>
          </div>

          <div style="
            display: flex;
            flex-direction: column;
            background-color: #1f1d2e;
            border: 1px solid #403d52;
            border-top: 4px solid #31748f;
            border-radius: 16px;
            width: 327px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          ">
            <span style="
              font-size: 13px;
              color: #908caa;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">Repositories</span>
            <span style="
              font-family: 'Instrument Serif';
              font-size: 48px;
              color: #e0def4;
              margin-top: 4px;
            ">${formatNumber(statistics.totalRepos)}</span>
          </div>
        </div>

        ${
          statistics.mostStarredRepo
            ? `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #1f1d2e;
            border: 1px solid #f6c17740;
            border-left: 6px solid #f6c177;
            border-radius: 16px;
            padding: 20px 24px;
            box-shadow: 0 16px 32px rgba(0,0,0,0.3);
          ">
            <div style="
              display: flex;
              flex-direction: column;
              width: 440px;
            ">
              <span style="
                font-size: 12px;
                color: #908caa;
                text-transform: uppercase;
                letter-spacing: 2px;
              ">★ Top Repository</span>
              <span style="
                display: flex;
                font-family: 'Instrument Serif', 'Noto Sans JP';
                font-size: 34px;
                color: #e0def4;
                margin-top: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${statistics.mostStarredRepo.name}</span>
            </div>
            <div style="
              display: flex;
              font-size: 24px;
              color: #f6c177;
              font-weight: bold;
            ">
              ★ ${formatNumber(statistics.mostStarredRepo.stars)}
            </div>
          </div>
        `
            : ''
        }

      </div>

      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 420px;
        height: 550px;
        background-color: #1f1d2e;
        border: 1px solid #c4a7e730;
        border-top: 4px solid #c4a7e7;
        border-radius: 20px;
        padding: 32px;
        box-shadow: 0 16px 32px rgba(0,0,0,0.4);
        box-sizing: border-box;
      ">

        <div style="
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          margin-bottom: 32px;
        ">
          <span style="
            font-size: 13px;
            color: #908caa;
            text-transform: uppercase;
            letter-spacing: 2px;
          ">Languages</span>
          <div style="
            display: flex;
            background-color: #c4a7e715;
            border: 1px solid #c4a7e740;
            border-radius: 12px;
            padding: 4px 12px;
            color: #c4a7e7;
            font-size: 12px;
          ">
            ${statistics.languages.length} used
          </div>
        </div>

        <div style="
          display: flex;
          position: relative;
          width: 200px;
          height: 200px;
          align-items: center;
          justify-content: center;
        ">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style="position: absolute; top: 0; left: 0;"
          >
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="rgba(144,140,170,0.1)"
              stroke-width="38"
            />
            ${pieSlicesHtml}
          </svg>
          <img
            src="${statistics.avatarUrl}"
            style="
              width: 90px;
              height: 90px;
              border-radius: 45px;
              border: 4px solid #1f1d2e;
            "
          />
        </div>

        <div style="
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 40px;
          gap: 16px;
        ">
          ${barsHtml}
        </div>

      </div>
    </div>
  `)
}
