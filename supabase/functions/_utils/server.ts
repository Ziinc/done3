
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from "npm:express@4.18.2";
import cors from "npm:cors";

export const setupServer = ()=>{
    const app = express();
    app.use(
      cors({
        origin: true,
        allowedHeaders: [
          "authorization",
          "x-client-info",
          "apikey",
          "content-type",
        ],
        methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
      })
    );
    app.use(express.json());

    const port = 3000;
    app.listen(port, () => {
        console.log(`Express server listening on port ${port}`);
      });
      
    return app
}