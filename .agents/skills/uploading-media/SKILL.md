---
name: uploading-media-in-vercel
description: Which and How to use Vercel's blob storage
---

![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)

Next.js (/app)

Choose a framework to optimize documentation to:

- ![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)
  
  Next.js (/app)
- ![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)
  
  Next.js (/pages)
- Other frameworks

On this page

# Client Uploads with Vercel Blob

Vercel Blob is available on [all plans](/docs/plans)

Those with the [owner, member, developer](</docs/rbac/access-roles#owner, member, developer-role>) role can access this feature

In this guide, you'll learn how to do the following:

- Use the Vercel dashboard to create a Blob store connected to a project
- Upload a file using the Blob SDK from a browser

## Prerequisites

Vercel Blob works with any frontend framework. First, install the package:

pnpmyarnnpmbun

Terminal

```
pnpm i @vercel/blob
```

Terminal

```
yarn add @vercel/blob
```

Terminal

```
npm i @vercel/blob
```

Terminal

```
bun add @vercel/blob
```

1. ### Create a Blob store
   
   1. Go to your project's [Storage section in the sidebar](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fstores&title=Go+to+Storage)
   2. Select Create Database, then choose Blob
   3. Select Continue, then set the access to Private or Public
   4. Use the name "Images" and select Create a new Blob store
   5. Select the environments where you would like the read-write token to be included. Production and Preview are preselected; include Development if you plan to work with the store locally. You can also update the prefix of the Environment Variable in Advanced Options
   
   Once created, you are taken to the Vercel Blob store page.
   
2. ### Prepare your local project
   
   Since you created the Blob store in a project, we automatically created and added the following Environment Variables to the project for you.
   
   The default setup uses OIDC authentication with short-lived, auto-rotated credentials:
   
   - `BLOB_STORE_ID` — identifies your Blob store
   - `VERCEL_OIDC_TOKEN` — a short-lived token automatically rotated by Vercel; used with `BLOB_STORE_ID` for server-side access
   
   A long-lived static token is also added as a fallback and is required for generating client upload tokens:
   
   - `BLOB_READ_WRITE_TOKEN` — a long-lived static read-write token; required by `handleUpload` and `handleUploadPresigned` to generate client tokens for browser uploads, and for code that runs outside Vercel
   
   To use these Environment Variables locally, we recommend pulling them with the Vercel CLI:
   
   ```
   vercel env pull
   ```
   
   If the Blob variables don't show up in your `.env.local` file, your store connection likely doesn't include the Development environment, which is the one `vercel env pull` reads from. You can add it from the store's Projects tab: open the context menu (⋯) next to your project, select Update Project Connection, and include Development.
   

When you need to upload files larger than 4.5 MB, you can use client uploads. The file goes directly from the browser to Vercel Blob, secured by a token exchange between your server and Vercel Blob.

You must authenticate and authorize users in the `onBeforeGenerateToken` callback of your server route before generating a client token. Without authentication, anyone can upload files to your Blob store. See [authenticating client uploads](#authenticating-client-uploads) for details.

1. ### Create a client upload page
   
   This page allows you to upload files to Vercel Blob. The files will go directly from the browser to Vercel Blob without going through your server.
   
   Behind the scenes, the upload is done securely by exchanging a token with your server before uploading the file.
   
   Next.js (/app)Next.js (/pages)Other frameworks
   
   src/app/avatar/upload/page.tsx
   
   TypeScript
   
   TypeScriptJavaScriptBash
   
   ```
   'use client';
    
   import { type PutBlobResult } from '@vercel/blob';
   import { upload } from '@vercel/blob/client';
   import { useState, useRef } from 'react';
    
   export default function AvatarUploadPage() {
     const inputFileRef = useRef<HTMLInputElement>(null);
     const [blob, setBlob] = useState<PutBlobResult | null>(null);
     return (
       <>
         <h1>Upload Your Avatar</h1>
    
         <form
           onSubmit={async (event) => {
             event.preventDefault();
    
             if (!inputFileRef.current?.files) {
               throw new Error('No file selected');
             }
    
             const file = inputFileRef.current.files[0];
    
             const newBlob = await upload(file.name, file, {
               access: 'private' /* or 'public' */,
               handleUploadUrl: '/api/avatar/upload',
             });
    
             setBlob(newBlob);
           }}
         >
           <input name="file" ref={inputFileRef} type="file" required />
           <button type="submit">Upload</button>
         </form>
         {blob && (
           <div>
             Blob url: <a href={blob.url}>{blob.url}</a>
           </div>
         )}
       </>
     );
   }
   ```
   
2. ### Create a client upload route
   
   The responsibility of this client upload route is to:
   
   1. Authenticate and authorize the user making the upload request
   2. Generate tokens for client uploads
   3. Listen for completed client uploads, so you can update your database with the URL of the uploaded file for example
   
   The `@vercel/blob` npm package exposes a helper to implement said responsibilities.
   
   Next.js (/app)Next.js (/pages)Other frameworks
   
   src/app/api/avatar/upload/route.ts
   
   TypeScript
   
   TypeScriptJavaScriptBash
   
   ```
   import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
   import { NextResponse } from 'next/server';
    
   export async function POST(request: Request): Promise<NextResponse> {
     const body = (await request.json()) as HandleUploadBody;
    
     try {
       const jsonResponse = await handleUpload({
         body,
         request,
         onBeforeGenerateToken: async (
           pathname,
           /* clientPayload */
         ) => {
           // Authenticate users before generating the token
           // const session = await auth();
           // if (!session) throw new Error('Not authenticated');
    
           return {
             allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
             addRandomSuffix: true,
             tokenPayload: JSON.stringify({
               // Store the authenticated user's ID so you can use it
               // in onUploadCompleted
               // userId: session.user.id,
             }),
           };
         },
         onUploadCompleted: async ({ blob, tokenPayload }) => {
           // Called by Vercel Blob when the client upload completes
           // Use tools like ngrok if you want this to work locally
    
           console.log('blob upload completed', blob, tokenPayload);
    
           try {
             // Run any logic after the file upload completed
             // const { userId } = JSON.parse(tokenPayload);
             // await db.update({ avatar: blob.url, userId });
           } catch (error) {
             throw new Error('Could not update user');
           }
         },
       });
    
       return NextResponse.json(jsonResponse);
     } catch (error) {
       return NextResponse.json(
         { error: (error as Error).message },
         { status: 400 }, // The webhook will retry 5 times waiting for a 200
       );
     }
   }
   ```
   

## Authenticating client uploads

The `onBeforeGenerateToken` callback in your server route runs before the SDK generates a client token. You must verify that the requesting user is authenticated and authorized to upload before returning a token. Without this check, your upload route is open to the public.

The following example checks a session before returning a token:

app/api/avatar/upload/route.ts

```
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
 
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Verify the user is authenticated
        const session = await auth();
        if (!session) {
          throw new Error('Not authenticated');
        }
 
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { userId } = JSON.parse(tokenPayload);
        // Update your database with the blob URL for the authenticated user
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
```

When implementing authentication:

- Check the user's session or token inside `onBeforeGenerateToken`
- Throw an error if the user isn't authenticated
- Pass user-identifying data through `tokenPayload` so you can associate the upload with the user in `onUploadCompleted`

See the [`handleUpload` SDK reference](/docs/vercel-blob/using-blob-sdk#handleupload) for all available options.

## Testing your page

1. ### Run your application locally
   
   Run your application locally and visit `/avatar/upload` to upload the file to your store. The browser will display the unique URL created for the file.
   
2. ### Review the Blob object metadata
   
   - Go to the Vercel Project where you created the store
   - Open Storage in the sidebar and select your new store
   - Paste the blob object URL returned in the previous step in the Blob URL input box in the Browser section and select Lookup
   - The following blob object metadata will be displayed: file name, path, size, uploaded date, content type and HTTP headers
   - You also have the option to download and delete the file from this page

You have successfully uploaded an object to your Vercel Blob store and are able to review its metadata, download, and delete it from your Vercel Storage Dashboard.

### onUploadCompleted callback behavior

The `onUploadCompleted` callback is called by Vercel API when a client upload completes. For this to work, `@vercel/blob` computes the correct callback URL to call based on the environment variables of your project.

We use the following environment variables to compute the callback URL:

- `VERCEL_BRANCH_URL` in preview environments
- `VERCEL_URL` in preview environments where `VERCEL_BRANCH_URL` is not set
- `VERCEL_PROJECT_PRODUCTION_URL` in production environments

These variables are automatically set by Vercel through [System Environment Variables](/docs/environment-variables/system-environment-variables). If you're not using System Environment Variables, use the `callbackUrl` option at the [`onBeforeGenerateToken`](/docs/vercel-blob/using-blob-sdk#onbeforegeneratetoken) step in `handleUpload`.

#### Local development

When running your application locally, the `onUploadCompleted` callback will not work as Vercel Blob cannot contact your localhost. Instead, we recommend you run your local application through a tunneling service like [ngrok](https://ngrok.com/), so you can experience the full Vercel Blob development flow locally.

When using ngrok in local development, you can configure the domain to call for onUploadCompleted by using the `VERCEL_BLOB_CALLBACK_URL` environment variable in your [`.env.local` file](https://nextjs.org/docs/pages/guides/environment-variables) when using Next.js:

```
VERCEL_BLOB_CALLBACK_URL=https://abc123.ngrok-free.app
```

## Next steps

- Learn how to [use the methods](/docs/vercel-blob/using-blob-sdk) available with the `@vercel/blob` package

Related Vercel documentation

## Cross-link map: Client Uploads (/docs/vercel-blob/client-upload)

> From the Vercel docs graph (built 2026-08-19T05:24:32.353Z), spanning vercel.com docs + KB, nextjs.org, ai-sdk.dev, and other Vercel documentation sites. Full graph as JSON: [https://vercel.com/docs/graph.json](https://vercel.com/docs/graph.json)

### Semantically closest pages

- [How do I bypass the 4.5MB body size limit of Vercel Serverless Functions?](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions?from=graph) — Learn how to deal with the body size limit of Serverless Functions on Vercel.
- [How can I use AWS S3 with Vercel?](https://vercel.com/kb/guide/how-can-i-use-aws-s3-with-vercel?from=graph) — Example how to use AWS S3 library on Vercel
- [Server Uploads](https://vercel.com/docs/vercel-blob/server-upload?from=graph) — Learn how to upload files to Vercel Blob using Server Actions and Route Handlers
- [Build with Vercel Blob on Next.js](https://vercel.com/kb/guide/vercel-blob-nextjs?from=graph) — Deploy the Vercel Blob Next.js Starter and learn how client uploads store images securely in a private Blob store.
- [How to upload and store files with Vercel](https://vercel.com/kb/guide/how-to-upload-and-store-files-with-vercel?from=graph) — Vercel file uploads done right cover Server Actions, client-direct upload, and multipart for 5 TB files, with auth and c

### Prerequisites

- [Blob](https://vercel.com/docs/vercel-blob?from=graph) — Vercel Blob is a scalable, cost-effective object storage service with private and public access modes for files of any s

### This page links to (3)

- [Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables?from=graph) — Learn to add and access environment variables in your Next.js application.
- [System Environment Variables](https://vercel.com/docs/environment-variables/system-environment-variables?from=graph) — System environment variables are automatically populated by Vercel, such as the URL of the deployment or the name of the
- [Using the SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk?from=graph) — Learn how to use the Vercel Blob SDK to access your blob store from your apps.

### Pages that link here (11)

By site: nextjs (1) · vercel-kb (4) · vercel-docs (6)

#### From nextjs

- [Videos](https://nextjs.org/docs/app/guides/videos?from=graph) — Recommendations and best practices for optimizing videos in your Next.js application.

#### From vercel-kb

- [How to process user-uploaded files with Vercel Sandbox and Vercel Blob](https://vercel.com/kb/guide/user-uploaded-files-vercel-sandbox-and-blob?from=graph) — Learn how to upload files to Vercel Blob, process them safely with FFmpeg in an isolated Vercel Sandbox, and store the r
- [Build with Vercel Blob on Next.js](https://vercel.com/kb/guide/vercel-blob-nextjs?from=graph) — Deploy the Vercel Blob Next.js Starter and learn how client uploads store images securely in a private Blob store.
- [Build Imgur-style image hosting with Nuxt and Vercel Blob](https://vercel.com/kb/guide/vercel-blob-nuxt-imgur-clone?from=graph) — Learn how to build an Imgur-style paste-to-share image host using Nuxt and Vercel Blob, with direct-to-storage client up
- [Vercel Blob vs Netlify Blobs](https://vercel.com/kb/guide/vercel-blob-vs-netlify-blobs?from=graph) — Compare Vercel Blob and Netlify Blobs on storage model, public URLs, delivery, limits, and pricing to choose the right o

#### From vercel-docs

- [Blob](https://vercel.com/docs/vercel-blob?from=graph) — Vercel Blob is a scalable, cost-effective object storage service with private and public access modes for files of any s
- [Private Storage](https://vercel.com/docs/vercel-blob/private-storage?from=graph) — Learn how to use private Vercel Blob storage to serve files with authentication
- [Public Storage](https://vercel.com/docs/vercel-blob/public-storage?from=graph) — Learn how to use public Vercel Blob storage to serve files accessible to anyone with the URL
- [Server Uploads](https://vercel.com/docs/vercel-blob/server-upload?from=graph) — Learn how to upload files to Vercel Blob using Server Actions and Route Handlers
- [Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing?from=graph) — Learn about the pricing for Vercel Blob.
- [Using the SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk?from=graph) — Learn how to use the Vercel Blob SDK to access your blob store from your apps.




![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)

Next.js (/app)

Choose a framework to optimize documentation to:

- ![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)
  
  Next.js (/app)
- ![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-light.2d2j04-25g3vf.svg)![](/vc-ap-vercel-docs/_next/static/immutable/media/logo-next-dark.0jqrwuxq05oly.svg)
  
  Next.js (/pages)

On this page

# Server Uploads with Vercel Blob

Vercel Blob is available on [all plans](/docs/plans)

Those with the [owner, member, developer](</docs/rbac/access-roles#owner, member, developer-role>) role can access this feature

In this guide, you'll learn how to do the following:

- Use the Vercel dashboard to create a Blob store connected to a project
- Upload a file using the Blob SDK from the server

Vercel has a [4.5 MB request body size limit](/docs/functions/runtimes#request-body-size) on Vercel Functions. If you need to upload larger files, use [client uploads](/docs/vercel-blob/client-upload).

## Prerequisites

Vercel Blob works with any frontend framework. First, install the package:

TypeScriptPython

pnpmyarnnpmbun

Terminal

```
pnpm i @vercel/blob
```

Terminal

```
yarn add @vercel/blob
```

Terminal

```
npm i @vercel/blob
```

Terminal

```
bun add @vercel/blob
```

1. ### Create a Blob store
   
   1. Go to your project's [Storage section in the sidebar](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fstores&title=Go+to+Storage)
   2. Select Create Database, then choose Blob
   3. Select Continue, then set the access to Private or Public
   4. Use the name "Images" and select Create a new Blob store
   5. Select the environments where you would like the read-write token to be included. Production and Preview are preselected; include Development if you plan to work with the store locally. You can also update the prefix of the Environment Variable in Advanced Options
   
   Once created, you are taken to the Vercel Blob store page.
   
2. ### Prepare your local project
   
   Since you created the Blob store in a project, we automatically created and added the following Environment Variables to the project for you.
   
   By default, connected stores use OIDC-based authentication with short-lived, automatically rotated credentials:
   
   - `BLOB_STORE_ID` — identifies your Blob store
   - `VERCEL_OIDC_TOKEN` — a short-lived token issued at runtime; rotated automatically
   
   The following variable is also added as a fallback for code running outside Vercel or to generate client tokens for browser uploads:
   
   - `BLOB_READ_WRITE_TOKEN` — a long-lived static read-write token
   
   To use these Environment Variables locally, we recommend pulling them with the Vercel CLI:
   
   ```
   vercel env pull
   ```
   
   If the Blob variables don't show up in your `.env.local` file, your store connection likely doesn't include the Development environment, which is the one `vercel env pull` reads from. You can add it from the store's Projects tab: open the context menu (⋯) next to your project, select Update Project Connection, and include Development.
   

Server uploads are perfectly fine as long as you do not need to upload files larger than [4.5 MB on Vercel](/docs/functions/runtimes#request-body-size). If you need to upload larger files, consider using [client uploads](/docs/vercel-blob/client-upload).

## Upload a file using Server Actions

TypeScriptPython

The following example shows how to use a [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) with Next.js App Router to upload a file to Vercel Blob.

app/components/form.tsx

TypeScript

TypeScriptJavaScriptBash

```
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
 
export async function Form() {
  async function uploadImage(formData: FormData) {
    'use server';
    const imageFile = formData.get('image') as File;
    const blob = await put(imageFile.name, imageFile, {
      access: 'private' /* or 'public' */,
      addRandomSuffix: true,
    });
    revalidatePath('/');
    return blob;
  }
 
  return (
    <form action={uploadImage}>
      <label htmlFor="image">Image</label>
      <input
        type="file"
        id="image"
        name="image"
        accept="image/jpeg, image/png, image/webp"
        required
      />
      <button>Upload</button>
    </form>
  );
}
```

Read more about [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) and [App Router](https://nextjs.org/docs) on the Next.js documentation.

## Upload a file using a server upload page and route

You can upload files to Vercel Blob using Route Handlers/API Routes. The following example shows how to upload a file to Vercel Blob using a server upload page and route.

1. ### Create a server upload page
   
   This page will upload files to your server. The files will then be sent to Vercel Blob.
   
   TypeScriptPython
   
   Next.js (/app)Next.js (/pages)
   
   src/app/avatar/upload/page.tsx
   
   TypeScript
   
   TypeScriptJavaScriptBash
   
   ```
   'use client';
    
   import type { PutBlobResult } from '@vercel/blob';
   import { useState, useRef } from 'react';
    
   export default function AvatarUploadPage() {
     const inputFileRef = useRef<HTMLInputElement>(null);
     const [blob, setBlob] = useState<PutBlobResult | null>(null);      return (        <>          <h1>Upload Your Avatar</h1>               <form            onSubmit={async (event) => {              event.preventDefault();                   if (!inputFileRef.current?.files) {                throw new Error('No file selected');              }                   const file = inputFileRef.current.files[0];                   const response = await fetch(                `/api/avatar/upload?filename=${file.name}`,                {                  method: 'POST',                  body: file,                },              );                   const newBlob = (await response.json()) as PutBlobResult;                   setBlob(newBlob);            }}          >            <input              name="file"              ref={inputFileRef}              type="file"              accept="image/jpeg, image/png, image/webp"              required            />            <button type="submit">Upload</button>          </form>          {blob && (            <div>              Blob url: <a href={blob.url}>{blob.url}</a>            </div>          )}        </>      );    }    ```     2. ### Create a server upload route        This route forwards the file to Vercel Blob and returns the URL of the uploaded file to the browser.        TypeScriptPython        Next.js (/app)Next.js (/pages)        src/app/api/avatar/upload/route.ts        TypeScript        TypeScriptJavaScriptBash        ```    import { put } from '@vercel/blob';    import { NextResponse } from 'next/server';         export async function POST(request: Request): Promise<NextResponse> {      const { searchParams } = new URL(request.url);      const filename = searchParams.get('filename');           const blob = await put(filename, request.body, {        access: 'private' /* or 'public' */,        addRandomSuffix: true,      });           return NextResponse.json(blob);    }    ```     ### Testing your page 1. ### Run your application locally        Run your application locally and visit `/avatar/upload` to upload the file to your store. The browser will display the unique URL created for the file.     2. ### Review the Blob object metadata        - Go to the Vercel Project where you created the store    - Open Storage in the sidebar and select your new store    - Paste the blob object URL returned in the previous step in the Blob URL input box in the Browser section and select Lookup    - The following blob object metadata will be displayed: file name, path, size, uploaded date, content type and HTTP headers    - You also have the option to download and delete the file from this page You have successfully uploaded an object to your Vercel Blob store and are able to review its metadata, download, and delete it from your Vercel Storage Dashboard. ## Next steps - Learn how to [use the methods](/docs/vercel-blob/using-blob-sdk) available with the `@vercel/blob` package

Related Vercel documentation

## Cross-link map: Server Uploads (/docs/vercel-blob/server-upload)

> From the Vercel docs graph (built 2026-08-19T05:24:32.353Z), spanning vercel.com docs + KB, nextjs.org, ai-sdk.dev, and other Vercel documentation sites. Full graph as JSON: [https://vercel.com/docs/graph.json](https://vercel.com/docs/graph.json)

### Semantically closest pages

- [The Complete Guide to Vercel Blob](https://vercel.com/kb/guide/vercel-blob?from=graph) — Vercel Blob stores and serves files of any size through Vercel's global network. Learn how Blob works, what it costs, an
- [Build with Vercel Blob on Next.js](https://vercel.com/kb/guide/vercel-blob-nextjs?from=graph) — Deploy the Vercel Blob Next.js Starter and learn how client uploads store images securely in a private Blob store.
- [Build with Vercel Blob on Nuxt](https://vercel.com/kb/guide/vercel-blob-nuxt?from=graph) — Set up Vercel Blob in a Nuxt application with NuxtHub, upload and serve files, and deliver optimized images with Nuxt Im
- [Examples](https://vercel.com/docs/vercel-blob/examples?from=graph) — Examples on how to use Vercel Blob in your applications
- [How can I use AWS S3 with Vercel?](https://vercel.com/kb/guide/how-can-i-use-aws-s3-with-vercel?from=graph) — Example how to use AWS S3 library on Vercel

### Prerequisites

- [Blob](https://vercel.com/docs/vercel-blob?from=graph) — Vercel Blob is a scalable, cost-effective object storage service with private and public access modes for files of any s

### This page links to (3)

- [Runtimes](https://vercel.com/docs/functions/runtimes?from=graph) — Runtimes transform your source code into Functions, which are served by our CDN. Learn about the official runtimes suppo
- [Client Uploads](https://vercel.com/docs/vercel-blob/client-upload?from=graph) — Learn how to upload files larger than 4.5 MB directly from the browser to Vercel Blob
- [Using the SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk?from=graph) — Learn how to use the Vercel Blob SDK to access your blob store from your apps.

### Pages that link here (8)

By site: nextjs (1) · vercel-kb (2) · vercel-docs (5)

#### From nextjs

- [Videos](https://nextjs.org/docs/app/guides/videos?from=graph) — Recommendations and best practices for optimizing videos in your Next.js application.

#### From vercel-kb

- [Build with Vercel Blob on Next.js](https://vercel.com/kb/guide/vercel-blob-nextjs?from=graph) — Deploy the Vercel Blob Next.js Starter and learn how client uploads store images securely in a private Blob store.
- [Vercel Blob vs Netlify Blobs](https://vercel.com/kb/guide/vercel-blob-vs-netlify-blobs?from=graph) — Compare Vercel Blob and Netlify Blobs on storage model, public URLs, delivery, limits, and pricing to choose the right o

#### From vercel-docs

- [Overview](https://vercel.com/docs/storage?from=graph) — Store large files and global configuration with Vercel's storage products.
- [Blob](https://vercel.com/docs/vercel-blob?from=graph) — Vercel Blob is a scalable, cost-effective object storage service with private and public access modes for files of any s
- [Private Storage](https://vercel.com/docs/vercel-blob/private-storage?from=graph) — Learn how to use private Vercel Blob storage to serve files with authentication
- [Public Storage](https://vercel.com/docs/vercel-blob/public-storage?from=graph) — Learn how to use public Vercel Blob storage to serve files accessible to anyone with the URL
- [Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing?from=graph) — Learn about the pricing for Vercel Blob.