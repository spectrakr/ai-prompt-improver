export const PROMPT_ANALYSIS_DIALOG = "improvement-dialog";

export const promptAnalysisDialog = (analysis: any) => `
            <div class="improvement-overlay"></div>
            <div class="improvement-content">
              <div class="improvement-header">
                <h3>프롬프트 개선 제안</h3>
                <button class="close-btn" id="close-dialog">×</button>
              </div>
              
              <div class="improvement-body">
                <div class="score-section">
                  <span class="score-label">현재 점수:</span>
                  <span class="score-value">${analysis.score}/100</span>
                </div>
                
                ${
    analysis.issues && analysis.issues.length > 0
        ? `
                  <div class="issues-section">
                    <h4>발견된 문제:</h4>
                    <ul>
                      ${analysis.issues.map((issue: string) => `<li>${issue}</li>`).join("")}
                    </ul>
                  </div>
                `
        : ""
}
                
                <div class="improved-section">
                  <h4>개선된 프롬프트</h4>
                  <div class="improved-text"></div>
                  <button class="btn btn-primary" id="modify" style="margin-top: 20px">수정</button>
                  <button class="btn btn-primary" id="complete" style="margin-top: 20px; display: none">완료</button>
                </div>
                
                ${
    analysis.improvements && analysis.improvements.length > 0
        ? `
                  <div class="improvements-section">
                    <h4>개선 사항</h4>
                    <ul>
                      ${analysis.improvements.map((imp: string) => `<li>${imp}</li>`).join("")}
                    </ul>
                  </div>
                `
        : ""
}
              </div>
              
              <div class="improvement-footer">
                <button class="btn btn-secondary" id="use-original">원본 사용</button>
                <button class="btn btn-primary" id="use-improved">개선된 프롬프트 사용</button>
              </div>
            </div>
          `;