import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "./../../../lib/db"
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_ID,
          clientSecret: process.env.GOOGLE_SECRET,
          authorizationUrl: `https://accounts.google.com/o/oauth2/auth?response_type=code&prompt=consent&access_type=offline&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}`
        })
      ],
    // adapter : MongoDBAdapter(client),
})

