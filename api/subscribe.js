const { Resend } = require('resend');
const { google } = require('googleapis');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : undefined,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: '이름과 이메일을 모두 입력해주세요.'
      });
    }

    // Save to Google Sheets
    if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_CREDENTIALS) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Sheet1!A:C',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[new Date().toISOString(), name, email]],
          },
        });
        console.log('✅ Google Sheets: Data saved');
      } catch (error) {
        console.error('❌ Google Sheets error:', error);
      }
    }

    // Send email via Resend
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        await resend.emails.send({
          from: 'CEO멘탈코치 <' + process.env.RESEND_FROM_EMAIL + '>',
          to: email,
          subject: '신태순 작가 신간 출간 알림 신청 완료',
          html: `
          <div style="font-family: Pretendard, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(to bottom, #0f172a, #1e293b); color: #f1f5f9; border-radius: 16px;">
            <h1 style="color: #fbbf24; font-size: 28px; margin-bottom: 24px; text-align: center;">안녕하세요, ${name}님!</h1>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 12px; border-left: 4px solid #fbbf24; margin-bottom: 20px;">
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.8; margin-bottom: 16px;">
                <strong>신태순 작가의 신간 알림 신청해주셔서 감사합니다.</strong>
              </p>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
                신태순 작가는 각양각색의 CEO분들을 코칭해오고, 해결하기 힘든 문제들을 같이 고민하고 해결하는 시간을 보냈는데요.
              </p>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
                이전에 10권의 책 집필 이후,<br>
                사장님들의 멘탈을 잡을 수 있는 현실적인 이야기를 바탕으로 실제로 액션할 수 있는 포인트를 곁들여서 볼 수 있는 책을 집필중입니다.
              </p>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
                외로운 의사 결정 과정에서 느낄 수 있는 심리적인 문제도 같이 짚으면서 진심어린 위로와 근원적인 관점의 변화와 행동의 변화를 이끌어주는 책입니다.
              </p>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
                알림 신청 다시한번 감사드립니다.
              </p>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 0;">
                쓰레드에서도 교류하고 서로 응원했으면 좋겠습니다!
              </p>
            </div>
            
            <div style="background: rgba(251, 191, 36, 0.1); padding: 20px; border-radius: 12px; margin: 24px 0;">
              <p style="color: #fbbf24; font-size: 15px; line-height: 1.7; margin-bottom: 12px;">
                <strong>쓰레드도 팔로우해주세요.</strong>
              </p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                따로 태그를 통해서 출간 알림을 원하시면 쓰레드로 DM 주세요. 감사합니다.
              </p>
              <a href="https://www.threads.com/@shintaesoon" 
                 style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
                쓰레드 팔로우하기 →
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.2);">
              <p style="color: #94a3b8; font-size: 14px; margin: 0; text-align: right;">
                감사합니다.<br>
                <strong style="color: #fbbf24;">CEO멘탈코치</strong>
              </p>
            </div>
          </div>
        `,
        });
        console.log('✅ Resend: Email sent');
      } catch (error) {
        console.error('❌ Resend error:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: '출간 알림 신청이 완료되었습니다!'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
}
