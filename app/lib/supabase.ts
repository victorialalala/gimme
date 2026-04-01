import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yawnmnibzpctxokzsqce.supabase.co";
const supabaseKey = "sb_publishable_UnLJVWioqu_DqD-y9a8thQ_RSMVq0Za";

export const supabase = createClient(supabaseUrl, supabaseKey);
