import loadPkg from 'load-pkg'

export default async () => (await loadPkg()) || {}
