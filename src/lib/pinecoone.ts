import { Pinecone, Vector } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import {PDFLoader  } from 'langchain/document_loaders/fs/pdf'
import {Document, RecursiveCharacterTextSplitter } from'@pinecone-database/doc-splitter';
import { getEmbeddings } from './embeding';
import md5 from 'md5';
import { Vector } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';


type PDFPage = {
    
    pageContent: string,
    metadata: {
        loc: {pageNumber: number}

    }

}

// let pinecone: PineconeClient | null = null

// const pinecone = new Pinecone();
export const getPineConeClient = async () => {
    console.log("Pinecone")
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    // if (!pinecone){
        // pinecone = new PineconeClient()
        // await pinecone.init({
        //     apiKey: process.env.PINECONE_API_KEY!,
        //     environment: process.env.PINECONE_ENVIRONMENT! 
        // });
        // return pinecone


    // }
}

export async function loadS3IntoPinecone(file_key: string){
    //obtain pdf -> download and read from pdf
    console.log(' downloading s3 into file system')
    const file_name = await downloadFromS3(file_key);
    if (!file_name){
        throw new Error('could not download from s3');
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    const documents = await Promise.all(pages.map(prepareDocument))

    // split and segment the PDF
    return pages;
} 

async function embedDocument(doc:Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent);

        return {
            hash,
            embeddings
        } as Vector
    } catch (error) {
        console.log("")
    }
}


// truncate the text content for pinecone to encode
export const truncateDtringByBytes = (str: string, bytes: number) =>{
    const enc = new TextEncoder()
    console.log(new TextDecoder('utf-8').decode(enc.encode('str').slice(0, bytes)));
    return new TextDecoder('utf-8').decode(enc.encode('str').slice(0, bytes))

    // Vectorize individual document

}


// take a single page split into multiple docs
async function prepareDocument(page: PDFPage){
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g, '')
    //split the docs
    const splitter =  new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata:{
                pageNumber: metadata.loc.pageNumber,
                text: truncateDtringByBytes(pageContent, 36000)
            }
        })
    ])
}

 