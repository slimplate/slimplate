import degit from 'degit'
import prompts from 'prompts'

/*

Do you want to use react? no
Do you want to use jekyl? yes
Do you host on github pages? yes
clone slimplate/template-jekyl, modify for ghpages deploy

Do you want to use react? yes
Is this static or dynamic? dynamic
Do you want to host on Cloudflare? no
Do you want to host on vercel? yes

clone slimplate/template-next, modify for vercel deploy

Do you want to use react? yes
Is this static or dynamic? static
Do you want to use nextjs? no
Do you want to host on surge? no
Do you want to host on Cloudflare? no
Do you want to host on vercel? yes

clone slimplate/template-static, modify for vercel deploy

Do you want to use react? yes
Is this static or dynamic? static
Do you want to use nextjs? no
Do you want to host on surge? no
Do you want to host on Cloudflare? yes

clone slimplate/template-static, modify for cf deploy

Do you want to use react? yes
Is this static or dynamic? static
Do you want to use nextjs? no
Do you want to host on surge? yes

clone slimplate/template-static, modify for surge deploy

Do you want to use react? yes
Is this static or dynamic? static
Do you want to use nextjs? yes
Do you want to host on surge? yes

clone slimplate/template-next, modify for static deploy on surge

Do you want to use react? yes
Is this static or dynamic? static
Do you want to use nextjs? yes
Do you want to host on surge? no
Do you host on github pages? yes

clone slimplate/template-static, modify for ghpages deploy

*/

console.log(`
Currently, we only support 1 kind of template: template-vercel-next.
Eventuially, this will ask you some questions.
`)

// do degit here
