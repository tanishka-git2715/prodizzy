$content = @"

# Added to bypass ISP blocking for Prodizzy Supabase
104.18.38.10 jjaepyotcyqedbdqtcxh.supabase.co
172.64.149.246 jjaepyotcyqedbdqtcxh.supabase.co
"@

Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value $content
