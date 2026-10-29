import { makeSignature } from "better-auth/crypto";

// Only trusted, rate-limited server actions call this bridge. No catch-all
// Better Auth API is exposed, so native sign-up cannot bypass EduHive policy.
export function createSessionService(auth, users) {
  return {
    async createSession(userId) {
      const user = await users.findUnique({ where: { id: userId } });
      if (!user?.emailVerifiedAt)
        throw new Error("Email verification required");
      const ctx = await auth.$context;
      return ctx.internalAdapter.createSession(userId);
    },
    async createSessionCookie(token, expiresAt) {
      const ctx = await auth.$context;
      const cookie = ctx.authCookies.sessionToken;
      return {
        name: cookie.name,
        value: `${token}.${await makeSignature(token, ctx.secret)}`,
        attributes: {
          ...cookie.attributes,
          ...(expiresAt
            ? {
                expires: expiresAt,
                maxAge: Math.max(
                  0,
                  Math.floor((expiresAt.getTime() - Date.now()) / 1000),
                ),
              }
            : {}),
        },
      };
    },
    async createBlankSessionCookie() {
      const ctx = await auth.$context;
      return {
        name: ctx.authCookies.sessionToken.name,
        value: "",
        attributes: { ...ctx.authCookies.sessionToken.attributes, maxAge: 0 },
      };
    },
    async invalidateSession(id) {
      const ctx = await auth.$context;
      const session = await ctx.adapter.findOne({
        model: "session",
        where: [{ field: "id", value: id }],
      });
      if (session) await ctx.internalAdapter.deleteSession(session.token);
    },
    async validate(headers, persistCookie) {
      const result = await auth.api.getSession({
        headers,
        query: { disableCookieCache: true },
      });
      if (!result) {
        if (persistCookie)
          await persistCookie(await this.createBlankSessionCookie());
        return { user: null, session: null };
      }
      const user = await users.findUnique({ where: { id: result.user.id } });
      if (!user?.emailVerifiedAt) {
        const ctx = await auth.$context;
        await ctx.internalAdapter.deleteSession(result.session.token);
        if (persistCookie)
          await persistCookie(await this.createBlankSessionCookie());
        return { user: null, session: null };
      }
      if (persistCookie)
        await persistCookie(
          await this.createSessionCookie(
            result.session.token,
            result.session.expiresAt,
          ),
        );
      // Never serialize session bearer tokens or private user fields into React.
      return {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          googleId: user.googleId,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        session: {
          id: result.session.id,
          userId: user.id,
          expiresAt: result.session.expiresAt,
        },
      };
    },
  };
}
