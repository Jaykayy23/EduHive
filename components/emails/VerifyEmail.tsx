interface VerifyEmailProps {
  username: string
  verifyUrl: string
}

export default function VerifyEmail({ username, verifyUrl }: VerifyEmailProps) {
  return (
    <div
      style={{
        backgroundColor: "#f6f7fb",
        color: "#172033",
        fontFamily: "Arial, sans-serif",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e7eaf2",
          borderRadius: "16px",
          margin: "0 auto",
          maxWidth: "560px",
          padding: "40px",
        }}
      >
        <p style={{ color: "#5b5ce2", fontSize: "20px", fontWeight: 700 }}>
          EduHive
        </p>
        <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>
          Verify your email
        </h1>
        <p style={{ color: "#526071", lineHeight: 1.6 }}>
          Hi {username}, confirm your email address to finish creating your
          EduHive account.
        </p>
        <p style={{ margin: "28px 0" }}>
          <a
            href={verifyUrl}
            style={{
              backgroundColor: "#5b5ce2",
              borderRadius: "10px",
              color: "#ffffff",
              display: "inline-block",
              fontWeight: 700,
              padding: "13px 20px",
              textDecoration: "none",
            }}
          >
            Verify email address
          </a>
        </p>
        <p style={{ color: "#687386", fontSize: "14px", lineHeight: 1.6 }}>
          This link expires in 24 hours and can only be used once. If you did
          not create an EduHive account, you can safely ignore this email.
        </p>
      </div>
    </div>
  )
}
