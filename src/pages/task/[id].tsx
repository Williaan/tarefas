import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import styles from './styles.module.css';
import Head from 'next/head';
import { db } from '@/services/firebaseConection';
import { doc, collection, where, query, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { Textarea } from '@/components/textarea';
import { FaTrash } from 'react-icons/fa';

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean,
        user: string,
        taskId: string,
    }

    allComments: CommentsProps[];
}


interface CommentsProps {
    id: string;
    name: string;
    user: string;
    comment: string;
    taskId: string;
}


export default function Tasks({ item, allComments }: TaskProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [comment, setComment] = useState<CommentsProps[]>(allComments || []);

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if (input === "") {
            return;
        }
        if (!session?.user?.email || !session?.user?.name) {
            return;
        }
        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user.name,
                taskId: item?.taskId
            });

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user.name,
                taskId: item?.taskId
            }
            setComment((oldItems) => [...oldItems, data]);
            setInput("");

        } catch (error) {
            console.log(error);

        }
    }

    async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);

            const deleComment = comment.filter((comment) => comment.id !== id);
            setComment(deleComment);

        } catch (error) {
            console.log(error);

        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Tarefas</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.comentsContainer}>
                <h2>Deixer comentário</h2>

                <form onSubmit={handleComment}>
                    <Textarea
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                            setInput(event.target.value)
                        }
                        placeholder='Deixe um comentário..'
                    />
                    <button
                        disabled={!session?.user}
                        className={styles.button}>Enviar comentário</button>
                </form>
            </section>

            <section className={styles.commentsContainer2}>
                <h2>Todos os comentários</h2>

                {comment.length === 0 && (
                    <span>Nenhum comentário foi encontrado..</span>
                )}

                {comment.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.trashComment} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash size={18} color='#EA3140' />
                                </button>
                            )}
                        </div>

                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);

    const consult = query(collection(db, "comments"), where("taskId", "==", id));

    const snapshoComments = await getDocs(consult);

    let allComments: CommentsProps[] = [];
    snapshoComments.forEach((doc) => {

        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,

        });
    });

    const snapshot = await getDoc(docRef);

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const milisegundos = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(milisegundos).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id
    }

    return {
        props: {
            item: task,
            allComments: allComments
        },
    }
}