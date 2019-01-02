<template>
    <div class="wrapper">
        <Card :bordered="false" dis-hover>
            <p slot="title">外接硬盘列表</p>
            <ul>
                <li v-for="(item,index) in hddList" :key="index">
                    <span>{{item.name}}</span>
                    (
                    <span>{{item.size}}</span>)
                    <Badge style="margin-left:20px;margin-right:20px;" v-if="item.isNtfs" status="processing" text="ntfs" />
                    <a href="#" @click.prevent="open(item)">打开</a>
                    <a href="#" @click.prevent="crack(item)">开启可读写</a>
                </li>
                <li v-show="hddList.length==0">暂未检测到外接存储</li>
            </ul>
            <!-- <Divider/> -->
            <Button class="refresh-btn" @click="getHddList();">刷新列表</Button>
        </Card>
    </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import { setTimeout } from "timers";
import Swal from "sweetalert2";

export default {
    name: "landing-page",
    components: { SystemInformation },
    data() {
        return {
            hddList: [],
            ntfsList: [],
            pwd: ""
        };
    },
    mounted() {
        this.getHddList();
        this.init();
    },
    methods: {
        init() {
            this.getHddList();
        },
        openLink(link) {
            this.$electron.shell.openExternal(link);
        },
        async getHddList() {
            let loading = this.$Message.loading({
                duration:0
            })
            // 获取硬盘信息lie 白
            let res = await this.$exec.info({
                cmd: `diskutil list`
            });
            setTimeout(loading)
            //  获取外接硬盘的列表
            res = res.split("\n\n").filter(item => {
                return item && item.indexOf("external") > -1 ? true : false;
            });
            console.log(res);
            // 处理外接硬盘的信息
            let arr = [];
            res.forEach(item => {
                let one = {};
                if (item.indexOf("Windows_NTFS") > -1) {
                    one.isNtfs = true;
                } else {
                    one.isNtfs = false;
                }
                item = item.split("\n");
                let nameStartPos = item[3].indexOf("Windows_NTFS") + 12;
                let sizeStartPos = item[1].indexOf("SIZE");
                while (item[3][sizeStartPos] !== " ") {
                    sizeStartPos--;
                }
                let idStartPos = item[1].indexOf("IDENTIFIER");
                while (item[3][idStartPos] !== " ") {
                    idStartPos--;
                }
                one.name = item[3].slice(nameStartPos, sizeStartPos).trim();
                one.size = item[3].slice(sizeStartPos, idStartPos).trim();
                arr.push(one);
            });

            this.hddList = arr;
        },
        open(path) {
            this.$exec.run({
                cmd: `open /Volumes`
            });
        },
        async crack(item) {
            let name = item.name.replace(/\s/g, "\\040");
            let fstabOld = await this.$fs.read({
                path: "/etc/fstab"
            });
            let fstab = fstabOld;
            fstab = fstab.split("\n");
            let nameList = [];
            fstab.forEach(item => {
                if (item) {
                    item = item.split("=");
                    nameList.push(item[1].split(" ")[0]);
                }
            });
            let hasEdit;
            for (let index in nameList) {
                if (nameList[index] === name) {
                    hasEdit = true;
                }
            }
            if (!hasEdit) {
                let fstabNew = `${fstabOld}\nLABEL=${name} none ntfs rw,auto,nobrowse`;
                await this.$fs.write({
                    text: fstabNew,
                    path: "/etc/fstab"
                });
            }
            // this.$fs.del({
            //     path:'/Volumes'
            // })
            this.$exec.run({
                cmd: `ln -s /Volumes ~/Desktop/Volumes`,
                close: code => {
                    this.$Message.success('拔掉硬盘重新插入生效')
                }
            });
        }
    }
};
</script>

<style scoped>
.wrapper {
    padding: 20px;
}
ul{
    padding-top:10px;
}
li{
    list-style: none;
    height: 30px;
    line-height: 30px;
    border-top:1px dotted #eaeaea;
}
li:nth-child(1){
    border-top:none;
}
li a{
    margin-left:10px;
}
.refresh-btn{
    margin-top: 40px;
}
</style>
