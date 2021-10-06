/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';

import { AiOutlineCalendar } from 'react-icons/ai';
import { FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const getReadTime = (): number => {
    const normalPeopleWordsPerMinute = 200;
    const totalWorldsArray = post.data.content.reduce((acc, content) => {
      const totalWorldsContentBody = content.body.reduce(
        (accumulator, body) => [...accumulator, ...body.text.split(' ')],
        []
      );
      return [...acc, ...totalWorldsContentBody, ...content.heading.split(' ')];
    }, []);

    return Math.ceil(totalWorldsArray.length / normalPeopleWordsPerMinute);
  };

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title} </title>
      </Head>
      <Header />
      <main className={styles.post__main}>
        <picture>
          <img src={post.data.banner.url} alt={post.data.title} />
        </picture>
        <article className={commonStyles.container}>
          <h1 className={commonStyles.title}>{post.data.title}</h1>
          <span className={commonStyles.info}>
            <AiOutlineCalendar fontSize={20} />
            <span className={commonStyles.info}>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <FiUser fontSize={20} />
            <span className={commonStyles.info}>{post.data.author}</span>
            <FiClock fontSize={20} />
            <span className={commonStyles.info}>{getReadTime()} min</span>
          </span>

          <div className={styles.content}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2 className={commonStyles.title}>{content.heading}</h2>
                {content.body.map(({ text }) => (
                  <p key={text} className={commonStyles.info}>
                    {text}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 2,
    }
  );

  // TODO

  return {
    paths: posts.results.map(res => ({ params: { slug: res.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post,
    },
    revalidate: 5 * 60,
  };
  // TODO
};
