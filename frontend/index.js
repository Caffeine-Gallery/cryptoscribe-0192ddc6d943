import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hidePostForm);
    document.getElementById('createPostForm').addEventListener('submit', handleSubmit);

    // Load initial posts
    await loadPosts();
});

function showPostForm() {
    document.getElementById('postForm').style.display = 'block';
    document.getElementById('newPostBtn').style.display = 'none';
}

function hidePostForm() {
    document.getElementById('postForm').style.display = 'none';
    document.getElementById('newPostBtn').style.display = 'block';
    document.getElementById('createPostForm').reset();
    quill.setContents([]);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const body = quill.root.innerHTML;

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...';
    submitBtn.disabled = true;

    try {
        await backend.createPost(title, body, author);
        hidePostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function loadPosts() {
    const loading = document.getElementById('loading');
    const postsContainer = document.getElementById('postsContainer');
    
    loading.style.display = 'block';
    
    try {
        const posts = await backend.getPosts();
        loading.style.display = 'none';
        
        const postsHTML = posts.map(post => `
            <article class="post-card">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">${post.author}</span>
                    <span class="date">${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}</span>
                </div>
                <div class="post-content">
                    ${post.body}
                </div>
            </article>
        `).join('');
        
        postsContainer.innerHTML = postsHTML;
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.style.display = 'none';
        postsContainer.innerHTML = '<p class="text-center text-danger">Error loading posts. Please try again later.</p>';
    }
}
