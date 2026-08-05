interface ResetPasswordProps {
  username: string
  resetUrl: string
}

export default function ResetPassword({ username, resetUrl }: ResetPasswordProps) {
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
          Reset your password
        </h1>
        <p style={{ color: "#526071", lineHeight: 1.6 }}>
          Hi {username}, we received a request to reset the password for your
          EduHive account.
        </p>
        <p style={{ margin: "28px 0" }}>
          <a
            href={resetUrl}
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
            Choose a new password
          </a>
        </p>
        <p style={{ color: "#687386", fontSize: "14px", lineHeight: 1.6 }}>
          This link expires in 30 minutes and can only be used once. If you did
          not request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  )
}
