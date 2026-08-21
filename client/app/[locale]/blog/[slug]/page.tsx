import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {isLocale,type Locale} from '../../../../i18n/config';
import CommentSection from './CommentSection';

type Props={params:Promise<{locale:string;slug:string}>};
type Post={name:string;slug:string;description?:string|null;content?:string|null;avatar?:string|null;published_at?:string|null;allow_comments?:boolean;user?:{name?:string};category?:{name?:string};tags?:Array<{id?:number;name?:string}>};
const API=process.env.BE_API_URL??process.env.NEXT_PUBLIC_BE_API_URL??'http://127.0.0.1:8000/api';

async function getPost(slug:string):Promise<Post|null>{const response=await fetch(`${API}/v1/client/post/${encodeURIComponent(slug)}`,{cache:'no-store'});if(response.status===404)return null;if(!response.ok)throw new Error(`Post API returned ${response.status}`);const payload=await response.json();return payload.data??null}

export async function generateMetadata({params}:Props):Promise<Metadata>{const{slug}=await params;try{const post=await getPost(slug);return post?{title:post.name,description:post.description??undefined}:{title:'Blog'}}catch{return{title:'Blog'}}}
export const dynamic='force-dynamic';

export default async function PostPage({params}:Props){const{locale:raw,slug}=await params;const locale:Locale=isLocale(raw)?raw:'vi';const vi=locale==='vi';let post:Post|null=null;try{post=await getPost(slug)}catch{return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12"><p>{vi?'Không thể tải bài viết. Vui lòng thử lại sau.':'Could not load this article. Please try again later.'}</p></main>}if(!post)notFound();return <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8 md:py-12"><Link href={`/${locale}/blog`} className="text-sm font-semibold hover:underline">← {vi?'Tất cả bài viết':'All articles'}</Link><article className="mt-6"><header><div className="flex flex-wrap gap-2 text-sm opacity-65"><span>{post.category?.name}</span>{post.published_at?<time>{new Intl.DateTimeFormat(vi?'vi-VN':'en-US',{dateStyle:'long'}).format(new Date(post.published_at))}</time>:null}{post.user?.name?<span>{vi?'Tác giả':'By'}: {post.user.name}</span>:null}</div><h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{post.name}</h1>{post.description?<p className="mt-4 text-lg leading-8 opacity-75">{post.description}</p>:null}</header>{post.avatar?<img src={post.avatar} alt={post.name} className="mt-7 max-h-[520px] w-full rounded-2xl object-cover"/>:null}<div className="blog-content mt-8 text-base leading-8" dangerouslySetInnerHTML={{__html:post.content||`<p>${vi?'Nội dung đang được cập nhật.':'Content is being updated.'}</p>`}}/>{post.tags?.length?<div className="mt-7 flex flex-wrap gap-2">{post.tags.map((tag,index)=><span key={tag.id??index} className="rounded-full border px-3 py-1 text-xs">#{tag.name}</span>)}</div>:null}</article><CommentSection slug={post.slug} locale={locale} enabled={post.allow_comments!==false}/></main>}
