/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const handleNextPageClick = async () => {
    try {
      const resultJson = await (await fetch(nextPage)).json();
      const { results, next_page } = resultJson;
      setNextPage(next_page);
      setPosts([...posts, ...results]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>Spacetraveling | Home </title>
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles['post-main']}`}>
        <div className={styles['posts-container']}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={styles.post}>
                <h2 className={commonStyles.title}>{post.data.title}</h2>
                <p className={commonStyles.subtitle}>{post.data.subtitle}</p>
                <span className={commonStyles.info}>
                  <AiOutlineCalendar fontSize={20} />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                  <FiUser fontSize={20} />
                  {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>
        {nextPage !== null && (
          <div className={styles['button-container']}>
            <button onClick={handleNextPageClick} type="button">
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  const { next_page, results } = postsResponse;

  // eslint-disable-next-line no-param-reassign
  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
